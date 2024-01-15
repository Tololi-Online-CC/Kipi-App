import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

interface SheetData {
  range: string;
  majorDimension: string;
  values: Array<Array<string>>;
}

const screenWidth = Dimensions.get('window').width;
const tableWidth = screenWidth * 0.95;

export default function App() {
  const [incomeData, setIncomeData] = useState<SheetData | null>(null);
  const [expensesData, setExpensesData] = useState<SheetData | null>(null);
  const [productPerformanceData, setProductPerformanceData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0); // New state variable


  const fetchData = async (sheetName: string, setDataFunction: React.Dispatch<React.SetStateAction<SheetData | null>>) => {
    try {
      const response = await axios.get<SheetData>(
        `https://sheets.googleapis.com/v4/spreadsheets/1dd3iyQR_3cMW9gFpyoyKbwLpwyBdzajQdA6qN31TjBI/values/${sheetName}?valueRenderOption=FORMATTED_VALUE&key=AIzaSyBi1vBNxajCCA26JnTVZBv80rZ12bufTkA`
      );

      response.data.values = response.data.values.slice(1);

      setDataFunction(response.data);
      await AsyncStorage.setItem(`${sheetName}Data`, JSON.stringify(response.data));
    } catch (error) {
      console.error(`Error fetching ${sheetName} data:`, error);
    } finally {
      setLoadingCount((prevCount) => prevCount + 1);
    }
  };

  const loadData = async (sheetName: string, setDataFunction: React.Dispatch<React.SetStateAction<SheetData | null>>) => {
    try {
      const storedData = await AsyncStorage.getItem(`${sheetName}Data`);
      if (storedData) {
        setDataFunction(JSON.parse(storedData));
      }
    } catch (error) {
      console.error(`Error loading ${sheetName} data from AsyncStorage:`, error);
    } finally {
      setLoadingCount((prevCount) => prevCount + 1);
    }
  };

  const checkInternetConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  };

  useEffect(() => {
    setLoadingCount(0);
    loadData('income', setIncomeData);
    loadData('expenses', setExpensesData);
    loadData('productPerformance', setProductPerformanceData);

    const networkListener = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        fetchData('income', setIncomeData);
        fetchData('expenses', setExpensesData);
        fetchData('productPerformance', setProductPerformanceData);
      }
    });

    return () => networkListener();
  }, []);

  useEffect(() => {
    if (loadingCount === 3) {
      setLoading(false); // Hide loader when all data sets are loaded
    }
  }, [loadingCount]);

  const handleRefresh = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      setLoading(true);
      setLoadingCount(0);
      fetchData('income', setIncomeData);
      fetchData('expenses', setExpensesData);
      fetchData('productPerformance', setProductPerformanceData);
    } else {
      Alert.alert('No internet connection. Please connect to the internet to refresh data.');
    }
  };


  //  Configuration for the charts
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 3, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0,
  };


  const renderLineChart = (data: SheetData | null, title: string) => {
    return (
      <>
        <Text style={styles.titleSmall}>{title}</Text>
        <View style={{ justifyContent: 'center' }}>
          <LineChart
            data={{
              labels: data?.values.map((row) => row[0]) || [],
              datasets: [{ data: data?.values.map((row) => parseFloat(row[1])) || [] }],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel={'N$'}
            chartConfig={chartConfig}
            bezier
          />
        </View>
      </>
    );
  };

  const renderBarChart = (data: SheetData | null, title: string) => {
    return (
      <>
        <Text style={styles.titleSmall}>{title}</Text>
        <View style={{ justifyContent: 'center' }}>
          <BarChart
            data={{
              labels: data?.values.map((row) => row[0]) || [],
              datasets: [{ data: data?.values.map((row) => parseFloat(row[1])) || [] }],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix=""
            chartConfig={chartConfig}
          />
        </View>
      </>
    );
  };




  return (
    <>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000000" />
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            contentContainerStyle={styles.buttonContainer}
            showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Finances</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Marketing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Operations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Human Resources</Text>
            </TouchableOpacity>

          </ScrollView>
          <ScrollView style={styles.container}>

            {renderLineChart(incomeData, 'Income')}
            {renderLineChart(expensesData, 'Expenses')}
            {renderBarChart(productPerformanceData, 'Product Performance')}

            <Text>{'\n'}</Text>
            <Button title='Refresh' onPress={handleRefresh}></Button>
            <Text>{'\n'}</Text>
            
          </ScrollView>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: {
    height: 35,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    backgroundColor: '#000', // Use your desired button color
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    // paddingVertical: 20,
  },
  titleSmall: {
    fontSize: 24,
    marginTop: 15,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    color: 'grey',
  },
  tableContainer: {
    width: tableWidth,
    flex: 1,
    paddingHorizontal: 5,
    // backgroundColor: '#fff',
    alignSelf: 'center',
  },
  text: {
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 0,
    fontSize: 11,
  },
});
