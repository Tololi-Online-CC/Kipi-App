import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import 'react-native-gesture-handler';
import { View, Text, Dimensions, ScrollView, ActivityIndicator, Button, Alert, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { Table, Rows } from 'react-native-reanimated-table';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DropDownPicker from 'react-native-dropdown-picker';

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
  const [taskProgressData, setTaskProgressData] = useState<SheetData | null>(null);
  const [staffDistributionData, setStaffDistributionData] = useState<SheetData | null>(null);


  const [loading, setLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState("finance");

  // Bottom Sheet

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['60%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleOpenPress = () => { bottomSheetRef.current?.expand(); };
  const renderBackDrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />, []
  );

  // DropDown 
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: 'Financial Statement', value: 'finance' },
    { label: 'Balance Sheet', value: 'balance' },
    { label: 'Income Statement', value: 'income' },
    { label: 'Liabilities Statement', value: 'liabilities' },
    { label: 'Product Performance', value: 'prodPerformance' },
    { label: 'Team Performance', value: 'teamPerformance' },
    { label: 'Operational Performance', value: 'opsPerformance' },
  ]);


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
    loadData('taskProgress', setTaskProgressData);
    loadData('staffDistribution', setStaffDistributionData);


    const networkListener = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        fetchData('income', setIncomeData);
        fetchData('expenses', setExpensesData);
        fetchData('productPerformance', setProductPerformanceData);
        fetchData('taskProgress', setTaskProgressData);
        fetchData('staffDistribution', setStaffDistributionData);
      }
    });

    return () => networkListener();
  }, []);

  useEffect(() => {
    if (loadingCount === 5) {
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
      fetchData('taskProgress', setTaskProgressData);
      fetchData('staffDistribution', setStaffDistributionData);
    } else {
      Alert.alert('No internet connection. Please connect to the internet to refresh data.');
    }
  };

  const handleSelection = (component: string) => {
    setSelectedComponent(component);
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
      <Link href={{ pathname: "/ChartInfo", params: { data: JSON.stringify(data), title, chartType: "line" }, }} asChild >
        <Pressable>
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
        </Pressable>
      </Link>
    );
  };

  const renderBarChart = (data: SheetData | null, title: string) => {
    return (
      <Link href={{ pathname: "/ChartInfo", params: { data: JSON.stringify(data), title, chartType: "bar" }, }} asChild >
        <Pressable>
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
        </Pressable>
      </Link>
    );
  };

  const renderTable = (data: SheetData | null, title: string) => {
    const tableData = data?.values || [];

    return (
      <Link href={{ pathname: "/ChartInfo", params: { data: JSON.stringify(data), title, chartType: "table" }, }} asChild >
        <Pressable>
          <Text style={styles.titleSmall}>{title}</Text>
          <View style={styles.tableContainer}>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
              <Rows data={tableData} style={{}} textStyle={{ margin: 5 }} />
            </Table>
          </View>
       
        </Pressable>
      </Link>
    );
  };

  const renderPieChart = (data: SheetData | null, title: string) => {
    const modernColors = [
      '#3498db', // Blue
      '#e74c3c', // Red
      '#2ecc71', // Green
      '#f39c12', // Yellow
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#d35400', // Orange
      '#34495e', // Dark Gray
      '#95a5a6', // Light Gray
    ];

    const pieChartData = data?.values.map((row, index) => ({
      name: row[0],
      population: parseInt(row[1], 10),
      color: modernColors[index % modernColors.length], // Use modulo to repeat colors if needed
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    })) || [];

    return (
      <Link href={{ pathname: "/ChartInfo", params: { data: JSON.stringify(data), title, chartType: "pie" }, }} asChild >
        <Pressable>
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.titleSmall}>{title}</Text>
            <PieChart
              data={pieChartData}
              width={screenWidth * 0.9}
              height={190}
              chartConfig={chartConfig}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft=''
              center={[5, 10]}
            />

          </View>
        </Pressable>
      </Link>
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
            <TouchableOpacity style={styles.button} onPress={() => handleSelection('finance')}>
              <Text style={styles.buttonText}>Finances</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText} onPress={() => handleSelection('marketing')}>Marketing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText} onPress={() => handleSelection('operations')}>Operations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText} onPress={() => handleSelection('hr')}>Human Resources</Text>
            </TouchableOpacity>

          </ScrollView>
          <ScrollView style={styles.container}>

            {
              selectedComponent === "finance" ? (
                <>
                  {renderLineChart(incomeData, 'Income')}
                  {renderLineChart(expensesData, 'Expenses')}
                  {renderBarChart(productPerformanceData, 'Product Performance')}
                </>

              ) : selectedComponent === "marketing" ? (
                <>
                  {renderLineChart(incomeData, 'Campaign Performance')}
                  {renderBarChart(productPerformanceData, 'Email Marketing KPIs')}
                  {renderLineChart(expensesData, 'Marketing Budget')}
                </>
              ) : selectedComponent === "operations" ? (
                <>
                  {renderLineChart(incomeData, 'Operation Performance')}
                  {renderLineChart(expensesData, 'Operation Tasks')}
                  {renderBarChart(productPerformanceData, 'Operation Budget')}
                </>
              ) : selectedComponent === "hr" ? (
                <>
                  {renderTable(taskProgressData, 'Task Progress')}
                  {renderPieChart(staffDistributionData, 'Staff Distribution')}
                  {renderBarChart(productPerformanceData, 'Product Performance')}
                </>
              ) : (
                <>
                  {renderLineChart(incomeData, 'Income')}
                  {renderLineChart(expensesData, 'Expenses')}
                  {renderBarChart(productPerformanceData, 'Product Performance')}
                </>
              )
            }

            <Text>{'\n'}</Text>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 30 }}>
              <Button title='Refresh' onPress={handleRefresh}></Button>
              <Button title='Export Reports' onPress={handleOpenPress}></Button>
            </View>
            <Text>{'\n'}</Text>

          </ScrollView>
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            backdropComponent={renderBackDrop}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.titleSmall}>Export Reports</Text>
              <Text style={styles.label}>Please select a report to export:</Text>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                // multiple={true}
                // max={15}
              />
              <TouchableOpacity style={{marginVertical: 25, width: "100%", height: 50,backgroundColor: "black", borderRadius: 8, justifyContent: 'center', alignItems: "center"}}>
                <Text style={{color: "white", fontSize: 18, fontWeight: "500"}}>Export</Text>
              </TouchableOpacity>
            </View>
          </BottomSheet>
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
    fontWeight: "500"
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
    marginTop: 25,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 10,
    // alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 15,
    color: 'grey',
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
});
