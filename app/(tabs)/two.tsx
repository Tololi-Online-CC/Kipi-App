import {
  Text,
  ScrollView,
  Dimensions,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Table, Rows } from 'react-native-table-component';

const screenWidth = Dimensions.get('window').width;
const tableWidth = screenWidth * 0.95;

export default function Dashboard() {
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

  const staffBarChartData = {
    labels: [
      'GM',
      'F&B Manager',
      'Front Office',
      'Housekeeping',
      'Laundry',
      'Cleaner',
      'Western Kitch.',
      'Chinese Kitch.',
      'Waiters',
      'Bartenders',
    ],
    datasets: [
      {
        data: [1, 1, 2, 3, 1, 1, 3, 9, 6, 4],
      },
    ],
  };

  const photoshootData = [
    {
      name: 'Pre-wedding',
      population: 1,
      color: '#3498db',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Matric Farewell',
      population: 4,
      color: '#2ecc71',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Private Shoot',
      population: 1,
      color: '#e74c3c',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
  ];

  // Line Chart Data
  const lineChartData = {
    labels: ['Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [800000, 450000, 1200000, 2100000, 2400000, 2900000],
      },
    ],
  };

  const expenseData = {
    labels: ['Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [450000, 170000, 660000, 720000, 850000, 790000],
      },
    ],
  };

  // Table Data for Task Progress
  const tableData = [
    ['Department', 'Completed Tasks (%)', 'Pending (%)', 'In Progress (%)'],
    ['Inspections', 75, 0, 25],
    ['IT', 100, 0, 0],
    ['GM', 54.55, 45.45, 0],
    ['Housekeep.', 100, 0, 0],
    ['Kitchen & Dining', 100, 0, 0],
    ['Front Office', 100, 0, 0],
    ['F & B', 50, 50, 0],
    ['Stock Control', 100, 0, 0],
    ['Maintenance', 80, 20, 0],
    ['Meili', 100, 0, 0],
    ['Store room', 100, 0, 0],
  ];

  const shadesOfBlue = [
    '#a2af65',
    '#c71e1e',
    '#5DADE2',
    '#c1c1c1',
    '#9a0000',
    '#0f0707',
    '#008080',
    '#FF6F61',
    '#21618C',
    '#FFA07A',
  ];

  const data = staffBarChartData.labels.map((label, index) => ({
    name: label,
    population: staffBarChartData.datasets[0].data[index],
    color: shadesOfBlue[index % shadesOfBlue.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  const roomData = {
    labels: ['1 Dec', '8 Dec', '15 Dec', '22 Dec', '29 Dec'],
    datasets: [
      {
        data: [14, 34, 27, 43, 43],
      },
    ],
  };

  return (
    <>
      <ScrollView
        horizontal
        contentContainerStyle={styles.buttonContainer}
        showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Last Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Last 3 Months</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>All Time</Text>
        </TouchableOpacity>
      </ScrollView>
      <ScrollView style={styles.container}>
        <Text style={styles.titleSmall}>Income</Text>
        <View style={{ justifyContent: 'center' }}>
          <LineChart
            data={lineChartData}
            width={screenWidth}
            height={220}
            yAxisLabel={'N$'}
            chartConfig={chartConfig}
          />
        </View>

        <Text style={styles.titleSmall}>Expenses</Text>
        <View style={{ justifyContent: 'center' }}>
          <LineChart
            data={expenseData}
            width={screenWidth}
            height={220}
            yAxisLabel={'N$'}
            chartConfig={chartConfig}
          />
        </View>

        <Text style={styles.titleSmall}>Task Progress</Text>
        <View style={styles.tableContainer}>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        </View>

        <Text>{'\n'}</Text>
        <Text style={styles.titleSmall}>Staff Distribution</Text>
        <View style={{ justifyContent: 'center' }}>
          <PieChart
            data={data}
            width={screenWidth * 0.9}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft=""
            center={[5, 10]}
            absolute
          />
        </View>

        <Text>{'\n'}</Text>
        <Text style={styles.titleSmall}>Occupied Rooms</Text>
        <View style={{ justifyContent: 'center' }}>
          <LineChart
            data={roomData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
          />
        </View>

        <Text style={styles.titleSmall}>Event Distribution</Text>
        <View style={{ justifyContent: 'center' }}>
          <PieChart
            data={photoshootData}
            width={screenWidth * 0.9}
            height={200}
            chartConfig={chartConfig}
            accessor={'population'}
            backgroundColor="transparent"
            paddingLeft=""
            center={[5, 0]}
            absolute
          />
        </View>
      </ScrollView>
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
    borderColor: "black",
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  titleSmall: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 20,
    fontFamily: 'SpaceMono-Regular',
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
