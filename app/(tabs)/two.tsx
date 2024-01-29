import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import 'react-native-gesture-handler';
import { RefreshControl } from 'react-native-gesture-handler';
import { View, Text, Dimensions, ScrollView, Button, Alert, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { Link } from 'expo-router';
import { Table, Rows } from 'react-native-reanimated-table';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DropDownPicker from 'react-native-dropdown-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


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
  const [webMetrics, setWebMetricsData] = useState<SheetData | null>(null);
  const [marketingBudget, setMarketingBudgetData] = useState<SheetData | null>(null);
  const [liabilities, setLiabilitiesData] = useState<SheetData | null>(null);
  const [assets, setAssetsData] = useState<SheetData | null>(null);

  const [selectedComponent, setSelectedComponent] = useState("finance");

  const [refreshing, setRefreshing] = useState(false);

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
    loadData('taskProgress', setTaskProgressData);
    loadData('staffDistribution', setStaffDistributionData);
    loadData('webMetrics', setWebMetricsData);
    loadData('marketingBudget', setMarketingBudgetData);
    loadData('assets', setAssetsData);
    loadData('liabilities', setLiabilitiesData);


    const networkListener = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        fetchData('income', setIncomeData);
        fetchData('expenses', setExpensesData);
        fetchData('productPerformance', setProductPerformanceData);
        fetchData('taskProgress', setTaskProgressData);
        fetchData('staffDistribution', setStaffDistributionData);
        fetchData('webMetrics', setWebMetricsData);
        fetchData('marketingBudget', setMarketingBudgetData);
        fetchData('assets', setAssetsData);
        fetchData('liabilities', setLiabilitiesData);
      }
    });

    return () => networkListener();
  }, []);


  // const handleRefresh = async () => {
  //   const isConnected = await checkInternetConnectivity();
  //   if (isConnected) {
  //     setRefreshing(true);
  //     fetchData('income', setIncomeData);
  //     fetchData('expenses', setExpensesData);
  //     fetchData('productPerformance', setProductPerformanceData);
  //     fetchData('taskProgress', setTaskProgressData);
  //     fetchData('staffDistribution', setStaffDistributionData);
  //     fetchData('webMetrics', setWebMetricsData);
  //     fetchData('marketingBudget', setMarketingBudgetData);
  //     fetchData('assets', setAssetsData);
  //     fetchData('liabilities', setLiabilitiesData);
  //     setRefreshing(false);
  //   } else {
  //     Alert.alert('No internet connection. Please connect to the internet to refresh data.');
  //     setRefreshing(false);
  //   }
  // };

  // Fetch new data from the server
  const fetchDataAndUpdateStorage = async (sheetName: string, setDataFunction: React.Dispatch<React.SetStateAction<SheetData | null>>) => {
    try {
      const response = await axios.get<SheetData>(
        `https://sheets.googleapis.com/v4/spreadsheets/1dd3iyQR_3cMW9gFpyoyKbwLpwyBdzajQdA6qN31TjBI/values/${sheetName}?valueRenderOption=FORMATTED_VALUE&key=AIzaSyBi1vBNxajCCA26JnTVZBv80rZ12bufTkA`
      );

      response.data.values = response.data.values.slice(1);

      setDataFunction(response.data);
      await AsyncStorage.setItem(`${sheetName}Data`, JSON.stringify(response.data)); // Update AsyncStorage

    } catch (error) {
      console.error(`Error fetching ${sheetName} data:`, error);
    }
  };

  const handleRefresh = async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      setRefreshing(true);

      // Call fetchDataAndUpdateStorage for each sheet you want to refresh
      await fetchDataAndUpdateStorage('income', setIncomeData);
      await fetchDataAndUpdateStorage('expenses', setExpensesData);
      await fetchDataAndUpdateStorage('productPerformance', setProductPerformanceData);
      await fetchDataAndUpdateStorage('taskProgress', setTaskProgressData);
      await fetchDataAndUpdateStorage('staffDistribution', setStaffDistributionData);
      await fetchDataAndUpdateStorage('webMetrics', setWebMetricsData);
      await fetchDataAndUpdateStorage('marketingBudget', setMarketingBudgetData);
      await fetchDataAndUpdateStorage('assets', setAssetsData);
      await fetchDataAndUpdateStorage('liabilities', setLiabilitiesData);

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

  const handleSelection = (component: string) => {
    setSelectedComponent(component);
  };


  // Exporting data to PDF format 
  const exportPDF = async (data: SheetData | null, filename: string) => {
    try {
      const htmlContent = `
        <style>
          table {
            font-family: Arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
        <table>
          ${data?.values.map((row, rowIndex) => `<tr${rowIndex === 0 ? ' style="background-color: #e0e0e0;"' : ''}>${row.map((cell, cellIndex) => `<${rowIndex === 0 ? 'th' : 'td'}>${cell}</${rowIndex === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}
        </table>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const pdfUri = `${FileSystem.cacheDirectory}${filename}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: pdfUri });

      await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Download PDF' });

    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const calculateNetIncome = (incomeData: SheetData | null, expensesData: SheetData | null): string => {
    try {
      if (!incomeData || !expensesData) {
        return 'N/A'; // Handle the case where data is null
      }

      const incomeSum: number = incomeData.values.reduce((sum, row) => sum + parseFloat(row[1] || '0'), 0);
      const expensesSum: number = expensesData.values.reduce((sum, row) => sum + parseFloat(row[1] || '0'), 0);

      const netIncome: number = incomeSum - expensesSum;
      return netIncome.toFixed(2).toString(); // Convert net income to string with two decimal places
    } catch (error) {
      console.error('Error calculating net income:', error);
      return 'N/A';
    }
  };

  // Function to format the monetary values with commas
  const formatWithCommas = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US');
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
      // If the value is a string and can be converted to a number, format it
      return parseFloat(value).toLocaleString('en-US');
    }
    return value;
  };


  const exportComprehensiveFinancialStatement = async (incomeData: SheetData | null, expensesData: SheetData | null, assetsData: SheetData | null, liabilitiesData: SheetData | null, filename: string) => {
    try {
      const htmlContent = `
      <style>
        body {
          margin-top: 96px;
        }
        div {
          width: 80%;
          margin: 0 auto;
        }
        table {
          font-family: Arial, sans-serif;
          font-size: 12px;
          border-collapse: collapse;
          width: 100%;
          margin: 0 auto;
          page-break-inside: avoid;
        }
        th, td {
          text-align: left;
          padding: 8px;
          width: 50%;
        }
        th {
          background-color: #4b4c4e;
          color: #fff;
        }
        h2 {
          text-align: center;
        }
        .page-break {
          break-before: page;
        }
        .general {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      </style>
      <body>
        <h2>Didact Digital CC</h2>
        <br/><br/>
        <div>
          <p>REGISTRATION NUMBER CC/2023/054831</p>
          <p>Annual Financial Statement for the year ended 28 February 2024</p>

          <h3 style="margin-top: 50px">General Information</h3>

          <div class="general">
            <div>
              <p>Country of incorporation and domicile:</p>
              <p>Nature of business and principal activities:</p>
              <p>Members:</p><br />
              <p>Registered office:</p>
              <p>Postal address:</p>
              <p>TIN:</p>
            </div>
            <div>
              <p>Namibia</p>
              <p>Technology service provider, Software</p>
              <p>Fillemon Luxulapo Muunda Nangolo; Edilson Danilo Bugalho Zau; Braulio Andre</p>
              <p>No. 13 Mozart Street Windhoek West, Windhoek, Namibia</p>
              <p>P O Box 2321, Walvis Bay, Namibia</p>
              <p>20313238132</p>
            </div>
          </div>
        </div>

        
        <div>
          <h3 class="page-break"></h3>
          <h3 style="padding-top: 96px;">Statement of Financial Position</h3>
          <h4>Income</h4>
          <table>
            <tr>
              <th>Income Type</th>
              <th>Amount</th>
            </tr>
            ${incomeData?.values
          .map(
            (row, rowIndex) =>
              `<tr>${row.map(
                (cell, cellIndex) =>
                  `<td>${cellIndex === 1 ? 'N$' : ''}${formatWithCommas(
                    cell
                  )}</td>`
              )}</tr>`
          )
          .join('')}
          </table>
        </div>
  
        <div>
          <h4>Expenses</h4>
          <table>
            <tr>
              <th>Expense Type</th>
              <th>Amount</th>
            </tr>
            ${expensesData?.values
          .map(
            (row, rowIndex) =>
              `<tr>${row.map(
                (cell, cellIndex) =>
                  `<td>${cellIndex === 1 ? 'N$' : ''}${formatWithCommas(
                    cell
                  )}</td>`
              )}</tr>`
          )
          .join('')}
          </table>
        </div>
  
        <h3 style='text-align: center;'>Net Income: N$${formatWithCommas(
            parseFloat(calculateNetIncome(incomeData, expensesData))
          )}</h3>
  
        <div>
          <h4>Assets</h4>
          <table>
            <tr>
              <th>Asset Type</th>
              <th>Value</th>
            </tr>
            ${assetsData?.values
          .map(
            (row, rowIndex) =>
              `<tr>${row.map(
                (cell, cellIndex) =>
                  `<td>${cellIndex === 1 ? 'N$' : ''}${formatWithCommas(
                    cell
                  )}</td>`
              )}</tr>`
          )
          .join('')}
          </table>
        </div>
       
        <div>
          <h3 class="page-break"></h3>
          <h4 style="padding-top: 96px;">Liabilities</h4>
          <table>
            <tr>
              <th>Liability Type</th>
              <th>Amount</th>
            </tr>
            ${liabilitiesData?.values
          .map(
            (row, rowIndex) =>
              `<tr>${row.map(
                (cell, cellIndex) =>
                  `<td>${cellIndex === 1 ? 'N$' : ''}${formatWithCommas(
                    cell
                  )}</td>`
              )}</tr>`
          )
          .join('')}
          </table>
        </div>
        
        <div>
          <h3 class="page-break"></h3>
          <h3 style="padding-top: 96px;">1. General Accounting Principles</h3>

          <h4>1.1 Accrual Basis</h4>
          <p>[Your Company Name] follows the accrual basis of accounting, recognizing revenues and expenses when they are earned or incurred, regardless of when the cash is received or paid.</p>

          <h4>1.2 Consistency</h4>
          <p>Consistent accounting principles are applied across financial periods to ensure comparability and accuracy in financial reporting.</p>

          <h4>1.3 Materiality</h4>
          <p>Transactions and events are recorded and disclosed based on their materiality, aiming to provide relevant information to users of financial statements.</p>

          <h3>2. Financial Statement Preparation</h3>

          <h4>2.1 Frequency</h4>
          <p>Financial statements are prepared [quarterly/annually] and presented to [management/shareholders/regulatory bodies].</p>

          <h4>2.2 GAAP Compliance</h4>
          <p>Financial statements are prepared in accordance with Generally Accepted Accounting Principles (GAAP) to ensure accuracy, consistency, and compliance with industry standards.</p>

          <h4>2.3 Management Responsibility</h4>
          <p>Management is responsible for the fair presentation of financial statements, including the design, implementation, and maintenance of internal controls.</p>

          <h3>3. Revenue Recognition</h3>

          <h4>3.1 Sale of Goods</h4>
          <p>Revenue from the sale of goods is recognized when the risks and rewards of ownership have transferred to the buyer.</p>

          <h3 class="page-break"></h3>
        
          <h4 style="padding-top: 96px;">3.2 Services</h4>
          <p>Revenue from services is recognized as services are performed, and when collectability is reasonably assured.</p>

          <h3>4. Expense Recognition</h3>

          <h4>4.1 Timing</h4>
          <p>Expenses are recognized in the period in which they are incurred, contributing to the generation of revenue.</p>

          <h4>4.2 Depreciation</h4>
          <p>Depreciation is calculated using the [straight-line/accelerated] method over the estimated useful life of the asset.</p>

          <h3>5. Assets and Liabilities</h3>

          <h4>5.1 Recognition</h4>
          <p>Assets and liabilities are recognized when it is probable that future economic benefits or obligations will arise, and their value can be reliably measured.</p>

          <h4>5.2 Valuation</h4>
          <p>Assets and liabilities are recorded at their historical cost, fair value, or other appropriate valuation basis.</p>

          <h3>6. Internal Controls</h3>

          <h4>6.1 Design and Implementation</h4>
          <p>Internal controls are designed and implemented to ensure the reliability of financial reporting, safeguarding of assets, and compliance with laws and regulations.</p>

          <h4>6.2 Monitoring</h4>
          <p>Regular monitoring and evaluation of internal controls are performed to identify and rectify any deficiencies.</p>
        </div>
      </body>
    `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const pdfUri = `${FileSystem.cacheDirectory}${filename}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: pdfUri });

      await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Download PDF' });
    } catch (error) {
      console.error('Error exporting comprehensive financial statement:', error);
    }
  };


  const handleExportComprehensiveFinancialStatement = useCallback(() => {
    exportComprehensiveFinancialStatement(incomeData, expensesData, assets, liabilities, 'comprehensive_financial_statement');
  }, [incomeData, expensesData, assets, liabilities]);

  const handleExportFinancialStatement = useCallback(() => {
    exportPDF(incomeData, 'financial_statement');
  }, []);

  const handleExportBalanceStatement = useCallback(() => {
    exportPDF(assets, 'balance_statement');
  }, []);

  const handleExportLiabilityStatement = useCallback(() => {
    exportPDF(liabilities, 'liability_statement');
  }, []);

  const handleExportIncomeStatement = useCallback(() => {
    exportPDF(incomeData, 'income_statement');
  }, []);

  const handleExportProductPerformance = useCallback(() => {
    exportPDF(productPerformanceData, 'product_performance');
  }, []);




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

      <ScrollView
        horizontal
        contentContainerStyle={styles.buttonContainer}
        showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.button} onPress={() => handleSelection('finance')}>
          <Text style={styles.buttonText}>Finances</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleSelection('marketing')}>
          <Text style={styles.buttonText}>Marketing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleSelection('hr')}>
          <Text style={styles.buttonText}>Human Resources</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => handleSelection('operations')}>
          <Text style={styles.buttonText}>Operations</Text>
        </TouchableOpacity>



      </ScrollView>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}>

        {
          selectedComponent === "finance" ? (
            <>
              {incomeData && renderLineChart(incomeData, 'Income')}
              {assets && renderBarChart(assets, 'Assets')}
              {expensesData && renderLineChart(expensesData, 'Expenses')}
              {liabilities && renderBarChart(liabilities, 'Liabilities')}
              {productPerformanceData && renderBarChart(productPerformanceData, 'Product Performance')}
            </>

          ) : selectedComponent === "marketing" ? (
            <>
              <Text style={styles.titleSmall}>Social Media Performance</Text>
              <View style={styles.highlightContainer}>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Impressions</Text>
                  <Text style={styles.highlightTextLarge}>2731</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Engagement</Text>
                  <Text style={styles.highlightTextLarge}>1320</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Reach</Text>
                  <Text style={styles.highlightTextLarge}>3920</Text>
                </View>

              </View>
              <View style={styles.highlightContainer}>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Followers</Text>
                  <Text style={styles.highlightTextLarge}>30</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Posts</Text>
                  <Text style={styles.highlightTextLarge}>7</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Likes</Text>
                  <Text style={styles.highlightTextLarge}>500</Text>
                </View>

              </View>
              {productPerformanceData && renderBarChart(productPerformanceData, 'Product Performance')}
              {webMetrics && renderLineChart(webMetrics, 'Website Performance')}
              <Text style={styles.titleSmall}>Email Performance</Text>
              <View style={styles.highlightContainer}>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Subscribers</Text>
                  <Text style={styles.highlightTextLarge}>2731</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Open Rate</Text>
                  <Text style={styles.highlightTextLarge}>69%</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Conversion</Text>
                  <Text style={styles.highlightTextLarge}>24.1%</Text>
                </View>

              </View>
              {marketingBudget && renderBarChart(marketingBudget, 'Marketing Budget')}
              {productPerformanceData && renderBarChart(productPerformanceData, 'Email Marketing KPIs')}

            </>
          ) : selectedComponent === "operations" ? (
            <>
              {incomeData && renderLineChart(incomeData, 'Operation Performance')}
              {expensesData && renderLineChart(expensesData, 'Operation Tasks')}
              {productPerformanceData && renderBarChart(productPerformanceData, 'Operation Budget')}
            </>
          ) : selectedComponent === "hr" ? (
            <>
              <Text style={styles.titleSmall}>HR Performance</Text>
              <View style={styles.highlightContainer}>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Satisfaction </Text>
                  <Text style={styles.highlightTextLarge}>87%</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Retention</Text>
                  <Text style={styles.highlightTextLarge}>100%</Text>
                </View>

              </View>
              <View style={styles.highlightContainer}>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Turnover </Text>
                  <Text style={styles.highlightTextLarge}>0%</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightTextSmall}>Productivity</Text>
                  <Text style={styles.highlightTextLarge}>93.3%</Text>
                </View>

              </View>
              {staffDistributionData && renderPieChart(staffDistributionData, 'Staff Distribution')}
              {taskProgressData && renderTable(taskProgressData, 'Task Progress')}

              {/* {renderBarChart(productPerformanceData, 'Product Performance')} */}
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
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginHorizontal: 30 }}>
          {/* <Button title='Refresh' onPress={handleRefresh}></Button> */}
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
          {
            value === 'finance' ? (
              <TouchableOpacity style={styles.exportButton} onPress={handleExportComprehensiveFinancialStatement}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
              </TouchableOpacity>
            ) : value === 'balance' ? (
              <TouchableOpacity style={styles.exportButton} >
                <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
              </TouchableOpacity>
            ) : value === 'income' ? (
              <TouchableOpacity style={styles.exportButton}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
              </TouchableOpacity>
            ) : value === 'liabilities' ? (
              <TouchableOpacity style={styles.exportButton}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
              </TouchableOpacity>
            ) : value === 'prodPerformance' ? (
              <TouchableOpacity style={styles.exportButton}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
              </TouchableOpacity>
            ) : (
              <></>
            )
          }
          {/* <TouchableOpacity style={{ marginVertical: 25, width: "100%", height: 50, backgroundColor: "black", borderRadius: 8, justifyContent: 'center', alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "500" }}>Export</Text>
          </TouchableOpacity> */}
        </View>
      </BottomSheet>

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
  label: {
    fontSize: 18,
    marginBottom: 15,
    color: 'grey',
  },
  tableContainer: {
    width: tableWidth,
    flex: 1,
    paddingHorizontal: 5,
    // backgroundColor: '#fff',
    alignSelf: 'center',
  },
  exportButton: {
    marginVertical: 25,
    width: "100%",
    height: 50,
    backgroundColor: "black",
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: "center"
  }
});
