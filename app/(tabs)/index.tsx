import { useState, useEffect, useCallback } from 'react';
import 'react-native-gesture-handler';
import { Text, Image, ScrollView, StyleSheet, View, Dimensions, Pressable, Alert, RefreshControl } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Link } from 'expo-router';

interface SheetData {
  range: string;
  majorDimension: string;
  values: Array<Array<string>>;
}

export default function App() {

  const screenWidth = Dimensions.get('window').width;
  const [refreshing, setRefreshing] = useState(false);


  const [incomeData, setIncomeData] = useState<SheetData | null>(null);
  const [expensesData, setExpensesData] = useState<SheetData | null>(null);
  const [productPerformanceData, setProductPerformanceData] = useState<SheetData | null>(null);
  const [staffDistributionData, setStaffDistributionData] = useState<SheetData | null>(null);
  const [summary, setSummaryData] = useState<SheetData | null>(null);



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
    }
  };

  const checkInternetConnectivity = async () => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  };

  useEffect(() => {
    loadData('income', setIncomeData);
    loadData('expenses', setExpensesData);
    loadData('productPerformance', setProductPerformanceData);
    loadData('staffDistribution', setStaffDistributionData);
    loadData('homeSummary', setSummaryData);


    const networkListener = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        fetchData('income', setIncomeData);
        fetchData('expenses', setExpensesData);
        fetchData('productPerformance', setProductPerformanceData);
        fetchData('staffDistribution', setStaffDistributionData);
        fetchData('homeSummary', setSummaryData);
      }
    });

    return () => networkListener();
  }, []);

  const handleRefresh = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      setRefreshing(true);
      fetchData('income', setIncomeData);
      fetchData('expenses', setExpensesData);
      fetchData('productPerformance', setProductPerformanceData);
      fetchData('homeSummary', setSummaryData);
      setRefreshing(false);
    } else {
      Alert.alert('No internet connection. Please connect to the internet to refresh data.');
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleRefresh()
  }, []);


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
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <LineChart
              data={{
                labels: data?.values.map((row) => row[0]) || [],
                datasets: [{ data: data?.values.map((row) => parseFloat(row[1])) || [] }],
              }}
              width={screenWidth}
              height={220}
              yAxisLabel={''}
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

  const renderCard = (data: SheetData, selectedTitle: string) => {
    // Find the index of the selected title in the first row of the data
    const titleIndex = data.values[0].indexOf(selectedTitle);

    // Check if the selected title is not found in the data
    if (titleIndex === -1) {
      return null;
    }

    // Get the corresponding value for the selected title from the second row
    const selectedValue = data.values[1][titleIndex];

    return (
      <View style={styles.highlightItem}>
        <Text style={styles.highlightTextSmall}>{selectedTitle}</Text>
        <Text style={styles.highlightTextLarge}>{selectedValue}</Text>
      </View>
    );
  };


  return (
    <>

      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}>

        <View style={styles.topContainer}>
          <Image
            source={require('./../../assets/images/WallpaperCraft.webp')}
            style={styles.backgroundImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.overlayText}>Didact Digital</Text>
        </View>

        <Text style={styles.title}>Welcome Back!</Text>

        <View>
          <View style={styles.highlightContainer}>
            {summary && renderCard(summary, "Total Income")}
            {summary && renderCard(summary, "Total Expenses")}
          </View>
          <View style={styles.highlightContainer}>
            {summary && renderCard(summary, "Business Clients")}
            {summary && renderCard(summary, "Users")}
          </View>
        </View>

        {incomeData && renderLineChart(incomeData, "Income")}
        {expensesData && renderBarChart(expensesData, "Expense")}
        {productPerformanceData && renderBarChart(productPerformanceData, "Product Performance")}
        {staffDistributionData && renderPieChart(staffDistributionData, "Staff Distribution")}

        <Text>{'\n'}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  topContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
    position: 'absolute',
    zIndex: 0, // Ensure the image is behind the overlay
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    opacity: 0.5,
    borderRadius: 8,
    zIndex: 1, // Ensure the overlay is above the image
  },
  overlayText: {
    color: 'white',
    fontSize: 24,
    zIndex: 2, // Ensure the text is above the overlay
  },
  title: {
    fontSize: 28,
    marginVertical: 20,
    fontWeight: 'bold'
  },
  titleSmall: {
    fontSize: 24,
    marginTop: 25,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  highlightContainer: {
    flex: 1,
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-between', // Distribute items evenly along the main axis
    alignItems: 'center',
  },
  highlightItem: {
    flex: 1, // Each item takes equal width
    backgroundColor: '#e0e0e0',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  highlightTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  highlightTextLarge: {
    fontSize: 18,
  },
});
