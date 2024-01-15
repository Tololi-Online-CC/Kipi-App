import {
  Text,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

export default function App() {
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

  const screenWidth = Dimensions.get('window').width;

  const incomeData = {
    labels: ['Rooms', 'Jade', 'Bar', 'Events'],
    datasets: [
      {
        data: [2000000, 1600000, 800000, 500000],
      },
    ],
  };

  const expenseData = {
    labels: ['Staff', 'COGS', 'Operations', 'Other'],
    datasets: [
      {
        data: [200000, 500000, 150000, 70000],
      },
    ],
  };

  const roomData = {
    labels: ['1 Dec', '8 Dec', '15 Dec', '22 Dec', '29 Dec'],
    datasets: [
      {
        data: [14, 34, 27, 43, 43],
      },
    ],
  };

  const eventData = [
    {
      name: 'KTV',
      population: 215,
      color: '#8ED5FC',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Bus. Center',
      population: 128,
      color: '#008080',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Board Room',
      population: 386,
      color: '#FF6F61',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Meili',
      population: 219,
      color: '#21618C',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
    {
      name: 'Bkf. Area',
      population: 98,
      color: '#FFA07A',
      legendFontColor: '#7F7F7F',
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={styles.container}>

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

          <View style={styles.highlightItem}>
            <Text style={styles.highlightTextSmall}>Total Income</Text>
            <Text style={styles.highlightTextLarge}>N$2.9M</Text>
          </View>

          <View style={styles.highlightItem}>
            <Text style={styles.highlightTextSmall}>Total Expenses</Text>
            <Text style={styles.highlightTextLarge}>N$725K</Text>
          </View>

        </View>
        <View style={styles.highlightContainer}>

          <View style={styles.highlightItem}>
            <Text style={styles.highlightTextSmall}>Rooms Occupied</Text>
            <Text style={styles.highlightTextLarge}>1432</Text>
          </View>

          <View style={styles.highlightItem}>
            <Text style={styles.highlightTextSmall}>Functions Held</Text>
            <Text style={styles.highlightTextLarge}>874</Text>
          </View>

        </View>
      </View>

      <Text style={styles.link}>View More</Text>

      <Text style={styles.titleSmall}>Income</Text>
      <View style={{ justifyContent: 'center' }}>
        <BarChart
          data={incomeData}
          width={screenWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={chartConfig}
        />
      </View>

      <Text style={styles.titleSmall}>Expenses</Text>
      <View style={{ justifyContent: 'center' }}>
        <BarChart
          data={expenseData}
          width={screenWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=''
          chartConfig={chartConfig}
        />
      </View>

      <Text style={styles.titleSmall}>Occupancy</Text>
      <View style={{ justifyContent: 'center' }}>
        <LineChart
          data={roomData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
        />
      </View>

      <Text style={styles.titleSmall}>Functions Held</Text>
      <PieChart
        data={eventData}
        width={screenWidth * 0.9}
        height={190}
        chartConfig={chartConfig}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft=''
        center={[5, 10]}
      />
      <Text>{'\n'}</Text>
    </ScrollView>
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
  },
  titleSmall: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 20,
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
  },
  highlightTextLarge: {
    fontSize: 18,
  },
  link: {
    color: 'black',
    textAlign: 'center',
    padding: 10,
  },
});
