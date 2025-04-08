// import * as React from 'react';
//this is the one
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Alert,
  Button,
  FlatList,
  Text,
  View,
  TextInput,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { Barometer } from "expo-sensors";
import { createContext, useState, useContext, useEffect } from "react";
import * as Notifications from "expo-notifications";
;
import { productName } from "expo-device";

const CartContext = createContext();

const Stack = createNativeStackNavigator();
const CRUDStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const CustCRUDStack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    async function configureNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions denied");
        return;
      }
    }
    configureNotifications();
  }, []);

  /*
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Admin Panel" }}
        />
        <Stack.Screen name="Stocks" component={FetchScreen} />
        <Stack.Screen
          name="ManageProducts"
          component={ManageProductsNavigator}
          options={{ title: "Admin Functions" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

*/
  //Screens I have:
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        <Stack.Screen
          name="Admin"
          component={CheckAdminNavigator}
          options={{ title: "Admin Functions" }}
        />

        <Stack.Screen
          name="AdminOptionsWindow"
          component={AdminOptionsNavigator}
          options={{ title: "Select your Functions" }}
        />

        <Stack.Screen
          name="Customer"
          component={CustomerNavigator}
          options={{ title: "Customer Functions" }}
        />

        <Stack.Screen
          name="CustomerOptions"
          component={CustomerOptionsNavigator}
          options={{ title: "Categories" }}
        />

        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: "Game - Barometer Data" }}
        />

        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: "Map - Check your Location" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

//Screens functions

const HomeScreen = ({ navigation }) => {
  const [{ pressure, relativeAltitude }, setData] = useState({
    pressure: 0,
    relativeAltitude: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const [scaleAdminButton] = useState(new Animated.Value(1));
  const [scaleCustomerButton] = useState(new Animated.Value(1));
  const [scaleGameButton] = useState(new Animated.Value(1));
  const [scaleMapButton] = useState(new Animated.Value(1));

  // Animations for button press
  const onPressIn = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // Function to handle barometer subscription
  const toggleBarometerListener = () => {
    if (subscription) {
      unsubscribeBarometer();
    } else {
      subscribeBarometer();
    }
  };

  const subscribeBarometer = () => {
    setSubscription(Barometer.addListener(setData));
  };

  const unsubscribeBarometer = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    // Clean up on component unmount
    return () => {
      unsubscribeBarometer();
    };
  }, [subscription]);

  return (
    <View style={styles5.container}>
      <Text style={styles5.header}>Welcome to YOUR CART</Text>

      {/* Admin Button with animation */}
      <Animated.View
        style={[
          styles5.buttonWrapper,
          { transform: [{ scale: scaleAdminButton }] },
        ]}
      >
        <TouchableOpacity
          style={styles5.button}
          onPressIn={() => onPressIn(scaleAdminButton)}
          onPressOut={() => onPressOut(scaleAdminButton)}
          onPress={() => navigation.navigate("Admin")}
        >
          <Text style={styles5.buttonText}>Enter as Admin</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Customer Button with animation */}
      <Animated.View
        style={[
          styles5.buttonWrapper,
          { transform: [{ scale: scaleCustomerButton }] },
        ]}
      >
        <TouchableOpacity
          style={styles5.button}
          onPressIn={() => onPressIn(scaleCustomerButton)}
          onPressOut={() => onPressOut(scaleCustomerButton)}
          onPress={() => navigation.navigate("Customer")}
        >
          <Text style={styles5.buttonText}>Enter as Customer</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Game Button with animation */}
      <Animated.View
        style={[
          styles5.buttonWrapper,
          { transform: [{ scale: scaleGameButton }] },
        ]}
      >
        <TouchableOpacity
          style={styles5.button}
          onPressIn={() => onPressIn(scaleGameButton)}
          onPressOut={() => onPressOut(scaleGameButton)}
          onPress={() => {
            // Navigate to GameScreen and pass the barometer data
            navigation.navigate("Game", {
              pressure: pressure,
              relativeAltitude: relativeAltitude,
            });
            toggleBarometerListener(); // Start listening to the barometer when the game button is pressed
          }}
        >
          <Text style={styles5.buttonText}>Check the Barometer Status</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Map */}
      <Animated.View
        style={[
          styles5.buttonWrapper,
          { transform: [{ scale: scaleMapButton }] },
        ]}
      >
        <TouchableOpacity
          style={styles5.button}
          onPressIn={() => onPressIn(scaleMapButton)}
          onPressOut={() => onPressOut(scaleMapButton)}
          onPress={() => {
            navigation.navigate("Map", {
              pressure: pressure,
              relativeAltitude: relativeAltitude,
            });
            toggleBarometerListener(); // Start listening to the barometer when the game button is pressed
          }}
        >
          <Text style={styles5.buttonText}>Check Your Location</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles5 = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonWrapper: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const CustomerNavigator = () => {
  return (
    <CustomerStack.Navigator>
      <CustomerStack.Screen
        name="CustomerLogin"
        component={CustomerLogin}
        options={{ title: "Checking Customer" }}
      />
      <CustomerStack.Screen
        name="CustomerSignup"
        component={CustomerSignup}
        options={{ title: "Registering Customer" }}
      />
    </CustomerStack.Navigator>
  );
};

//if customer login is successful, then customers are allowed to do shopping
//otherwise redirect to the Register page
//if succ:
const CustomerOptionsNavigator = () => {
  return (
    <CartProvider>
      <CustCRUDStack.Navigator>
        <CustCRUDStack.Screen
          name="FetchCategory"
          component={FetchCategory}
          options={{ title: "Categories" }}
        />
        <CustCRUDStack.Screen
          name="FetchProducts"
          component={FetchProducts}
          options={({ navigation }) => {
            const { cart } = useContext(CartContext); // Access context inside header
            return {
              title: "Products",
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CartPage")}
                >
                  <Text
                    style={{
                      backgroundColor: "#e81111",
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderRadius: 8,
                      marginHorizontal: 8,
                    }}
                  >
                    Cart ({Object.keys(cart).length})
                  </Text>
                </TouchableOpacity>
              ),
            };
          }}
        />
        <CustCRUDStack.Screen name="CartPage" component={CartPage} />
        <CustCRUDStack.Screen name="CheckoutPage" component={CheckoutPage} />
      </CustCRUDStack.Navigator>
    </CartProvider>
  );
};

const CheckAdminNavigator = () => {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen
        name="ADMIN Login"
        component={AdminLogin}
        options={{ title: "Checking ADMIN" }}
      />
    </AdminStack.Navigator>
  );
};

//need to write logic, if login successful on CheckAdminNavigator. Then, AdminOptionsNavigator
//will be called where Admin functions option will be available whether
//the admin wants to play with Product Categorys, or payment or product page.
const AdminOptionsNavigator = () => {
  return (
    <CRUDStack.Navigator>
      <CRUDStack.Screen
        name="ManageMain"
        component={ManageAdminScreen}
        options={{ title: "CRUD" }}
      />
      <CRUDStack.Screen
        name="ViewCategories"
        component={ViewCategoriesScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="AddCategory"
        component={AddCategoryScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="EditCategory"
        component={EditCategoryScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="DeleteCategory"
        component={DeleteCategoryScreen}
        options={{ headerShown: false }}
      />

      <CRUDStack.Screen
        name="ViewProducts"
        component={ViewProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="DeleteProduct"
        component={DeleteProductScreen}
        options={{ headerShown: false }}
      />
    </CRUDStack.Navigator>
  );
};

const ManageAdminScreen = ({ navigation }) => {
  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          justifyContent: "center",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          marginLeft: 80,
        }}
      >
        Manage Functions
      </Text>
      <Button
        title="List All Categorys"
        onPress={() => navigation.navigate("ViewCategories")}
      />
      <Button
        title="Add New Category"
        onPress={() => navigation.navigate("AddCategory")}
      />
      <Button
        title="Edit Category"
        onPress={() => navigation.navigate("EditCategory")}
      />
      <Button
        title="Delete Category"
        onPress={() => navigation.navigate("DeleteCategory")}
      />
      <Button
        title="List Any Specific Product"
        onPress={() => navigation.navigate("ViewProduct")}
      />
      <Button
        title="Add New Product"
        onPress={() => navigation.navigate("AddProduct")}
      />
      <Button
        title="Edit Product"
        onPress={() => navigation.navigate("EditProduct")}
      />
      <Button
        title="Delete Product"
        onPress={() => navigation.navigate("DeleteProduct")}
      />
    </View>
  );
};

/*
const ManageProductsNavigator = () => {
  return (
    <CRUDStack.Navigator>
      <CRUDStack.Screen
        name="ManageMain"
        component={ManageProductsScreen}
        options={{ title: "CRUD" }}
      />
      <CRUDStack.Screen
        name="ViewProduct"
        component={ViewProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ headerShown: false }}
      />
      <CRUDStack.Screen
        name="DeleteProduct"
        component={DeleteProductScreen}
        options={{ headerShown: false }}
      />
    </CRUDStack.Navigator>
  );
};

const ManageProductsScreen = ({ navigation }) => {
  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          justifyContent: "center",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
          marginLeft: 80,
        }}
      >
        Manage Products
      </Text>
      <Button
        title="List Any Specific Product"
        onPress={() => navigation.navigate("ViewProduct")}
      />
      <Button
        title="Add New Product"
        onPress={() => navigation.navigate("AddProduct")}
      />
      <Button
        title="Edit Product"
        onPress={() => navigation.navigate("EditProduct")}
      />
      <Button
        title="Delete Product"
        onPress={() => navigation.navigate("DeleteProduct")}
      />
    </View>
  );
};
*/
/*const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Button
        title="List All products"
        onPress={() => navigation.navigate("Fetch")}
      />
      <Button
        title="List any Specific Product"
        onPress={() => navigation.navigate("ViewProduct")}
      />
      <Button
        title="Add New Product"
        onPress={() => navigation.navigate("AddProduct")}
      />
      <Button title="Edit" onPress={() => navigation.navigate("EditProduct")} />
      <Button
        title="Delete"
        onPress={() => navigation.navigate("DeleteProduct")}
      />
    </View>
  );
};*/

/*const ViewProductScreen = ({ navigation }) => {
  const [productData, setProductData] = useState({name: '', price: '', ourId: ''})

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://b4b6-80-233-55-238.ngrok-free.app/getSpecificProduct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420" // See: https://stackoverflow.com/questions/73017353/how-to-bypass-ngrok-browser-warning
          },
          body: JSON.stringify({ ourId: '90' }) // Need to use POST to send body
        }
      )
      const data = await res.json()
      console.log(data)
      setProductData(data.theProduct)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <View>
      <Text>{'Product Name: ' + productData.name}</Text>
      <Text>{'Product ID: ' + productData.ourId}</Text>
      <Text>{'Product Price: ' + productData.price}</Text>
      <Button
        title="Get product details" onPress={async () => { callAPI() }}
      />
    </View>
  )
}
*/
/*const FetchScreen = ({ navigation }) => {
  const [text, setText] = useState('. . . waiting for fetch API')

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://03a3-80-233-49-238.ngrok-free.app`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": "69420" // See: https://stackoverflow.com/questions/73017353/how-to-bypass-ngrok-browser-warning
          },
          
        }
      )
      const data = await res.json()
      //  console.log(data)
      setText(JSON.stringify(data))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <View>
      <Text>{text}</Text>
      <Button
        title="Go Fetch Some Data" onPress={async () => { callAPI() }}
      />
    </View>
  )
}*/

// Check admin creds
const AdminLogin = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/loginAdmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      if (data.success) {
        navigation.replace("AdminOptionsWindow", { username });
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles1.container}>
      <Text style={styles1.subtitle}>Admin Login</Text>
      <TextInput
        placeholder="Username"
        style={styles1.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        style={styles1.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={login} />
    </ScrollView>
  );
};

const styles1 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centers the content vertically
    padding: 20, // Adds padding around the form
    backgroundColor: "#f5f5f5", // Set a background color to make it look cleaner
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20, // Space between subtitle and form
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20, // Space between input fields
    paddingHorizontal: 15,
    fontSize: 16,
  },
});

const CustomerLogin = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/loginCustomer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      if (data.success) {
        navigation.replace("CustomerOptions", {
          screen: "FetchCategory",
          params: { username },
        });
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles2.container}>
      <Text style={styles2.subtitle}>Customer Login</Text>
      <TextInput
        placeholder="Username"
        style={styles2.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        style={styles2.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Login"
        onPress={login}
        style={buttonStyles.primaryButton}
      />
      <View style={{ marginVertical: 10 }} />
      <Button
        title="Don't Have an account? Sign Up"
        onPress={() => navigation.navigate("CustomerSignup")}
        color="#007BFF"
      />
    </View>
  );
};

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

const buttonStyles = StyleSheet.create({
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 5,
    width: "70%",
  },
  secondaryButton: {
    backgroundColor: "#007BFF", // Secondary color (blue)
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff", // White text color for contrast
    fontWeight: "bold", // Bold text for emphasis
    fontSize: 16, // Slightly larger font for readability
    textAlign: "center", // Center align the text inside the button
  },
});

const CustomerSignup = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      const res = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/registerCustomer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );
      const data = await res.json();
      if (data.success) {
        Alert.alert("Signed Up Successfully", "You can now log in");
        navigation.replace("CustomerLogin");
      } else {
        Alert.alert("Signup Failed", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles3.container}>
      <Text style={styles3.subtitle}>Customer Sign Up</Text>
      <TextInput
        placeholder="Username"
        style={styles3.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Email"
        style={styles3.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles3.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Sign Up"
        onPress={signup}
        style={buttonStyles.primaryButton}
      />
      <Button
        title="Already Have an account? Login"
        onPress={() => navigation.navigate("CustomerLogin")}
        color="#007BFF"
      />
    </ScrollView>
  );
};

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

// add a new Category
const AddCategoryScreen = (navigation) => {
  const [Category, setCategory] = useState({
    name: "",
    maxProducts: "",
  });

  const addCategory = async () => {
    const { name, maxProducts } = Category;

    if (!name || !maxProducts) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/addCategory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            maxProducts: parseInt(maxProducts),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        Alert.alert("Success", `Category "${name}" added.`);
        setCategory({ name: "", maxProducts: "" });
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Server error. Try again later.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add New Category</Text>

      <TextInput
        style={inputStyle1}
        placeholder="Category Name"
        value={Category.name}
        onChangeText={(text) => setCategory({ ...Category, name: text })}
      />

      <TextInput
        style={inputStyle1}
        placeholder="Max Number of Products"
        keyboardType="numeric"
        value={Category.maxProducts}
        onChangeText={(text) => setCategory({ ...Category, maxProducts: text })}
      />

      <Button title="Add Category" onPress={addCategory} />
    </View>
  );
};

const inputStyle1 = {
  borderWidth: 1,
  padding: 10,
  marginVertical: 5,
  borderRadius: 5,
};

const AddProductScreen = (navigation) => {
  const [newProduct, setNewProduct] = useState({
    ourId: "",
    name: "",
    price: "",
    size: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://74d3-80-233-60-107.ngrok-free.app/categories"
        );
        const data = await res.json();
        setCategories(data.categories); // [{ id, name, maxProducts }]
      } catch (err) {
        console.error("Error fetching Categorys:", err);
        Alert.alert("Error", "Failed to load Categorys.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const addProduct = async () => {
    const { ourId, name, price, size, categoryId } = newProduct;

    if (!ourId || !name || !price || !size || !categoryId) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      // 1. Check how many products are already in this Category
      const countRes = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/category/${categoryId}/products/count`
      );
      const { count, maxProducts } = await countRes.json();

      if (count >= maxProducts) {
        Alert.alert(
          "Limit Reached",
          "This Category has reached its maximum allowed number of products."
        );
        return;
      }

      // 2. Proceed with product creation
      const res = await fetch(
        "https://04f8-80-233-52-107.ngrok-free.app/addProduct",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct),
        }
      );

      const data = await res.json();

      if (data.success) {
        setNewProduct({
          ourId: "",
          name: "",
          price: "",
          size: "",
          categoryId: "",
        });
        await sendNotification(name, ourId);
        Alert.alert("Success", "Product added successfully!");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong. Please try again.");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Error",
          body: "Something went wrong, Please try again!",
        },
        trigger: null,
      });
    }
  };

  if (loadingCategories) {
    return (
      <View style={{ padding: 20 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Add New Product</Text>

      <TextInput
        style={inputStyle}
        placeholder="Enter Product ID"
        keyboardType="numeric"
        value={newProduct.ourId}
        onChangeText={(text) => setNewProduct({ ...newProduct, ourId: text })}
      />

      <TextInput
        style={inputStyle}
        placeholder="Enter Product Name"
        value={newProduct.name}
        onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
      />

      <TextInput
        style={inputStyle}
        placeholder="Enter Product Price"
        keyboardType="numeric"
        value={newProduct.price}
        onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
      />

      <TextInput
        style={inputStyle}
        placeholder="Enter Product Size"
        value={newProduct.size}
        onChangeText={(text) => setNewProduct({ ...newProduct, size: text })}
      />

      <Text style={{ marginTop: 10 }}>Select Category:</Text>
      <Picker
        selectedValue={newProduct.categoryId}
        onValueChange={(value) =>
          setNewProduct({ ...newProduct, categoryId: value })
        }
      >
        <Picker.Item label="-- Select Category --" value="" />
        {categories.map((dept) => (
          <Picker.Item
            key={dept.id}
            label={`${dept.name} (Max: ${dept.maxProducts})`}
            value={dept.id}
          />
        ))}
      </Picker>

      <Button title="Add Product" onPress={addProduct} />
    </View>
  );
};

const inputStyle = {
  borderWidth: 1,
  padding: 10,
  marginVertical: 5,
  borderRadius: 5,
};

//Edit category
const EditCategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://74d3-80-233-60-107.ngrok-free.app/allCategories"
        );
        const data = await res.json();

        if (data.success && data.categories) {
          setCategories(data.categories); // [{ name, maxProducts }]
        } else {
          Alert.alert("Error", "Failed to load categories.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not fetch categories.");
      }
    };

    fetchCategories();
  }, []);

  // When a category is selected, fetch its full data
  const fetchCategory = async (name) => {
    if (!name) {
      setCategoryData(null);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/getCategoryByName",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();

      if (data.success && data.category) {
        setCategoryData(data.category);
      } else {
        Alert.alert("Error", "Category not found.");
        setCategoryData(null);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch category.");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async () => {
    if (!categoryData) return;

    const { name, maxProducts } = categoryData;

    if (!name.trim() || isNaN(maxProducts) || parseInt(maxProducts) <= 0) {
      Alert.alert("Error", "Please enter a valid name and max products.");
      return;
    }

    try {
      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/updateCategoryByName",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalName: selectedCategoryName,
            name: name.trim(),
            maxProducts: parseInt(maxProducts, 10),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        Alert.alert("Success", "Category updated!");
        setSelectedCategoryName("");
        setCategoryData(null);
      } else {
        Alert.alert("Error", "Failed to update category.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Edit Category</Text>

      <Text style={{ marginTop: 10 }}>Select a Category:</Text>
      <Picker
        selectedValue={selectedCategoryName}
        onValueChange={(value) => {
          setSelectedCategoryName(value);
          fetchCategory(value);
        }}
      >
        <Picker.Item label="-- Select Category --" value="" />
        {categories.map((cat) => (
          <Picker.Item
            key={cat.name}
            label={`${cat.name} (Max: ${cat.maxProducts})`}
            value={cat.name}
          />
        ))}
      </Picker>

      {loading && <ActivityIndicator size="small" style={{ marginTop: 10 }} />}

      {categoryData && (
        <View style={{ marginTop: 20 }}>
          <TextInput
            style={inputStyle2}
            placeholder="Category Name"
            value={categoryData.name}
            onChangeText={(text) =>
              setCategoryData({ ...categoryData, name: text })
            }
          />
          <TextInput
            style={inputStyle2}
            placeholder="Max Products"
            keyboardType="numeric"
            value={categoryData.maxProducts.toString()}
            onChangeText={(text) =>
              setCategoryData({ ...categoryData, maxProducts: text })
            }
          />

          <Button title="Update Category" onPress={updateCategory} />
        </View>
      )}
    </View>
  );
};

const inputStyle2 = {
  borderWidth: 1,
  padding: 10,
  marginVertical: 5,
  borderRadius: 5,
};

const EditProductScreen = ({ navigation }) => {
  const [productId, setProductId] = useState("");
  const [productData, setProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch all categories when screen mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(
          "https://74d3-80-233-60-107.ngrok-free.app/allCategories"
        );
        const data = await res.json();

        if (data.success && data.categories) {
          setCategories(data.categories); // [{ name, maxProducts }]
        } else {
          Alert.alert("Error", "Failed to load categories.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not fetch categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const sendNotification = async (productName, productId) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Product Updated!",
        body: `Product ${productName} (ID: ${productId}) updated successfully.`,
        data: { type: "edit", productId },
      },
      trigger: null,
    });
  };

  const fetchProduct = async () => {
    if (!productId.trim()) {
      Alert.alert("Error", "Please enter a Product ID");
      return;
    }

    try {
      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/getSpecificProduct",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ ourId: productId }),
        }
      );

      const data = await res.json();
      if (data.success && data.theProduct) {
        setProductData(data.theProduct);
      } else {
        Alert.alert("Error", "Product does not exist!");
        setProductData(null);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch product.");
    }
  };

  const updateProduct = async () => {
    if (!productData) return;

    try {
      const updatedProduct = {
        ourId: productId,
        name: productData.name.trim(),
        price: parseFloat(productData.price),
        size: productData.size.trim(),
        category: productData.category, // sending the category name
      };

      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/updateSpecificProduct",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct),
        }
      );

      const data = await res.json();

      if (data.success) {
        await sendNotification(productData.name, productData.ourId);
        setProductData({
          ourId: "",
          name: "",
          price: "",
          size: "",
          category: "",
        });
        setProductId("");
      } else {
        Alert.alert("Error", "Failed to update the product");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Edit Product</Text>

      <TextInput
        style={inputStyle3}
        placeholder="Enter Product ID"
        keyboardType="numeric"
        value={productId}
        onChangeText={setProductId}
      />

      <Button title="Fetch Product" onPress={fetchProduct} />
      <Button
        title="Check Stocks"
        onPress={() => navigation.navigate("Stocks")}
      />

      {productData ? (
        <View style={{ marginTop: 20 }}>
          <TextInput
            style={inputStyle3}
            placeholder="Product Name"
            value={productData.name}
            onChangeText={(text) =>
              setProductData({ ...productData, name: text })
            }
          />

          <TextInput
            style={inputStyle3}
            placeholder="Product Price"
            keyboardType="numeric"
            value={productData.price.toString()}
            onChangeText={(text) =>
              setProductData({ ...productData, price: text })
            }
          />

          <TextInput
            style={inputStyle3}
            placeholder="Product Size"
            value={productData.size}
            onChangeText={(text) =>
              setProductData({ ...productData, size: text })
            }
          />

          <Text style={{ marginTop: 10 }}>Select Category:</Text>
          {loadingCategories ? (
            <ActivityIndicator />
          ) : (
            <Picker
              selectedValue={productData.category}
              onValueChange={(value) =>
                setProductData({ ...productData, category: value })
              }
            >
              <Picker.Item label="-- Select Category --" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat.name} label={cat.name} value={cat.name} />
              ))}
            </Picker>
          )}

          <Button title="Update Product" onPress={updateProduct} />
        </View>
      ) : (
        productId && (
          <View style={{ marginTop: 20 }}>
            <Text>Product does not exist.</Text>
            <Button
              title="Check Stocks"
              onPress={() => navigation.navigate("Stocks")}
            />
          </View>
        )
      )}
    </View>
  );
};

const inputStyle3 = {
  borderWidth: 1,
  padding: 10,
  marginVertical: 5,
  borderRadius: 5,
};

// Delete category screen
const DeleteCategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://74d3-80-233-60-107.ngrok-free.app/allCategories"
        );
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          Alert.alert("Error", "Failed to load categories.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not fetch categories.");
      }
    };

    fetchCategories();
  }, []);

  const deleteCategory = async () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://74d3-80-233-60-107.ngrok-free.app/deleteCategoryByName",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: selectedCategory }),
        }
      );

      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", `Category '${selectedCategory}' deleted.`);
        setSelectedCategory("");
        setCategories((prev) =>
          prev.filter((cat) => cat.name !== selectedCategory)
        );
      } else {
        Alert.alert("Error", "Failed to delete category.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Delete Category</Text>

      <Text style={{ marginTop: 10 }}>Select Category:</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
      >
        <Picker.Item label="-- Select Category --" value="" />
        {categories.map((cat) => (
          <Picker.Item key={cat.name} label={cat.name} value={cat.name} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 10 }} />
      ) : (
        <Button title="Delete Category" onPress={deleteCategory} />
      )}
    </View>
  );
};

const DeleteProductScreen = ({ navigation }) => {
  const [productId, setProductId] = useState("");
  const sendNotification = async (productId) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Product Deleted!",
        body: `Product ${productId} is deleted successfully.`,
        data: { type: "delete", productId },
      },
      trigger: null,
    });
  };

  const deleteProduct = async () => {
    try {
      const res = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/deleteSpecificProduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ ourId: productId }),
        }
      );
      const data = await res.json();
      console.log(data);
      if (data.success) {
        /*Alert.alert(
          "Success",
          `Product ID ${productId} is deleted successfully`
        );*/
        await sendNotification(productId);
        setProductId("");
      } else {
        Alert.alert("Error", "Product not found, Try Again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete the product.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Delete Product</Text>

      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
        placeholder="Enter Product ID"
        keyboardType="numeric"
        value={productId}
        onChangeText={setProductId}
      />

      <Button title="Delete Product" onPress={deleteProduct} />

      <Button
        title="Check Stocks"
        onPress={() => navigation.navigate("Stocks")}
      />
    </View>
  );
};

//View Category

const ViewCategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://74d3-80-233-60-107.ngrok-free.app/allCategories"
        );
        const data = await res.json();

        if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          Alert.alert("Error", "No categories found.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>View Categories</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : categories.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          {categories.map((category) => (
            <Text key={category.name} style={{ fontSize: 16, marginBottom: 5 }}>
              {category.name}
            </Text>
          ))}
        </View>
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text>No categories available.</Text>
        </View>
      )}

      <Button
        title="Check Stocks"
        onPress={() => navigation.navigate("Stocks")}
      />
    </View>
  );
};

const ViewProductScreen = ({ navigation }) => {
  const [productData, setProductData] = useState(null);
  const [productId, setProductId] = useState("");

  const callAPI = async () => {
    try {
      const res = await fetch(
        `https://74d3-80-233-60-107.ngrok-free.app/getSpecificProduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ ourId: productId }),
        }
      );

      const data = await res.json();
      console.log(data);

      if (data.success && data.theProduct) {
        setProductData(data.theProduct);
      } else {
        setProductData(null);
      }
    } catch (err) {
      console.log(err);
      setProductData(null);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter Product ID:</Text>
      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
        placeholder="Enter Product ID"
        keyboardType="numeric"
        value={productId}
        onChangeText={setProductId}
      />

      <Button title="Search" onPress={callAPI} />
      <Button
        title="Check Stocks"
        onPress={() => navigation.navigate("Stocks")}
      />

      {productData ? (
        <View style={{ marginTop: 20 }}>
          <Text>{"Product Name: " + productData.name}</Text>
          <Text>{"Product Price: " + productData.price}</Text>
          <Text>{"Product Size: " + productData.size}</Text>
        </View>
      ) : (
        productId && (
          <View style={{ marginTop: 20, justifyContent: "center" }}>
            <Text>Product does not exist.</Text>
          </View>
        )
      )}
    </View>
  );
};

const FetchScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);

  const callAPI = async () => {
    try {
      const res = await fetch(`https://74d3-80-233-60-107.ngrok-free.app`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420", // See: https://stackoverflow.com/questions/73017353/how-to-bypass-ngrok-browser-warning
        },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        console.log("Failed to fetch Products", data.error);
      }
      //  console.log(data)
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    callAPI();
  }, []);

  return (
    <SafeAreaView>
      <TouchableOpacity
        style={{
          backgroundColor: "blue",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
          alignSelf: "center",
        }}
        onPress={callAPI}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Refresh Stocks
        </Text>
      </TouchableOpacity>

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View
              style={{
                marginVertical: 10,
                padding: 10,
                borderWidth: 1,
                borderRadius: 5,
              }}
            >
              <Text>{"Product Name: " + item.name}</Text>
              <Text>{"Product ID: " + item.ourId}</Text>
              <Text>{"Product Price: " + item.price}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No products available</Text>
      )}
      <Button
        title="Refresh the Stocks"
        onPress={async () => {
          callAPI();
        }}
      />
    </SafeAreaView>
  );
};

//To fetch all the categories
const FetchCategory = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://3.223.57.90/categories",
          {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          Alert.alert("Error", data.message || "Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        Alert.alert("Error", "Something went wrong while fetching categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 10 }}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🛒 Select a Category</Text>

      {categories.length === 0 ? (
        <Text style={styles.emptyText}>No categories available.</Text>
      ) : (
        categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate("FetchProducts", { category })}
          >
            <Text style={styles.cardText}>{category}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6200ee",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#f0f4f8",
  },
};

// To fetch Products

const FetchProducts = ({ route }) => {
  const navigation = useNavigation();
  const { category } = route.params;
  const { cart, setCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // Local quantity state
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("A-Z");

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://3.223.57.90/getProductsByCategory",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify({ category }),
          }
        );

        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products); // Initially showing all products
        } else {
          Alert.alert("Error", data.message || "Could not fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        Alert.alert("Error", "Something went wrong while fetching products.");
      }
    };

    fetchProducts();
  }, [category]);

  // Filter products based on price range
  const filterByPrice = () => {
    const filtered = products.filter((product) => {
      const price = product.price;
      return (
        (minPrice === "" || price >= parseFloat(minPrice)) &&
        (maxPrice === "" || price <= parseFloat(maxPrice))
      );
    });
    setFilteredProducts(filtered);
  };

  // Sort products by name (A-Z or Z-A)
  const sortProducts = (option) => {
    const sorted = [...filteredProducts];
    if (option === "A-Z") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    setFilteredProducts(sorted);
  };

  // Handle Quantity Change
  const handleQuantityChange = (productId, action) => {
    setQuantities((prev) => {
      const current = prev[productId] || 0;
      const newQty =
        action === "increase" ? current + 1 : Math.max(current - 1, 0);
      return {
        ...prev,
        [productId]: newQty,
      };
    });
  };

  // Add to Cart
  const handleAddToCart = (product) => {
    const quantity = quantities[product._id] || 0;
    if (quantity > 0) {
      setCart((prevCart) => ({
        ...prevCart,
        [product._id]: { ...product, quantity },
      }));
      Alert.alert("Added to Cart", `${quantity} x ${product.name}`);
    } else {
      Alert.alert("Error", "Quantity should be more than 0 to add to cart");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles7.container}>
      <Text style={styles7.header}>{category} Products</Text>

      {/* Filter Options */}
      <View style={styles7.filterContainer}>
        <View style={styles7.filterInputContainer}>
          <TextInput
            style={styles7.filterInput}
            placeholder="Min Price"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <TextInput
            style={styles7.filterInput}
            placeholder="Max Price"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </View>
        <TouchableOpacity onPress={filterByPrice} style={styles7.filterButton}>
          <Text style={styles7.filterButtonText}>Apply Price Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Display Products */}
      {filteredProducts.length === 0 ? (
        <Text style={styles7.noProductsText}>
          No products available in this category.
        </Text>
      ) : (
        filteredProducts.map((product) => (
          <View key={product._id} style={styles7.productCard}>
            <View style={styles7.productInfo}>
              <Text style={styles7.productName}>{product.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    productId: product._id,
                  })
                }
                style={styles7.viewButton}
              >
                <Text style={styles7.buttonText}>View</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles7.productPrice}>Price: ${product.price}</Text>

            <View style={styles7.quantityControl}>
              <TouchableOpacity
                onPress={() => handleQuantityChange(product._id, "decrease")}
                style={styles7.button}
              >
                <Text style={styles7.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles7.quantityText}>
                {quantities[product._id] || 0}
              </Text>
              <TouchableOpacity
                onPress={() => handleQuantityChange(product._id, "increase")}
                style={styles7.button}
              >
                <Text style={styles7.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleAddToCart(product)}
              style={styles7.addButton}
            >
              <Text style={styles7.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

// Updated Styling (styles7)
const styles7 = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  noProductsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  productPrice: {
    marginTop: 5,
    color: "#555",
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 15,
    color: "#333",
  },
  addButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // New styles for filter and sorting
  filterContainer: {
    marginBottom: 20,
  },
  filterInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterInput: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    width: "45%",
  },
  filterButton: {
    backgroundColor: "#4c92af",
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sortContainer: {
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
});

const CartPage = () => {
  const { cart, setCart } = useContext(CartContext);
  const navigation = useNavigation();

  const handleQuantityChange = (product, action) => {
    setCart((prevCart) => {
      // Clone the previous cart state to avoid mutating it
      const updatedCart = { ...prevCart };

      // Get the current product
      const prevItem = updatedCart[product._id] || { ...product, quantity: 0 };

      // Update the quantity based on the action
      const updatedItem = {
        ...prevItem,
        quantity:
          action === "increase"
            ? prevItem.quantity + 1
            : Math.max(prevItem.quantity - 1, 0), // Prevent going below 0
      };

      // Save the updated product back to the cart
      updatedCart[product._id] = updatedItem;

      return updatedCart;
    });
  };

  const totalPrice = Object.values(cart).reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Your Cart
      </Text>

      {Object.keys(cart).length === 0 ? (
        <Text style={{ fontSize: 18, color: "#000" }}>Your cart is empty.</Text>
      ) : (
        Object.keys(cart).map((productId) => {
          const product = cart[productId];
          return (
            <View key={productId} style={styles6.productContainer}>
              <View style={styles6.productInfo}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {product.name}
                </Text>
                <Text style={{ marginTop: 5 }}>Price: ${product.price}</Text>
              </View>

              <View style={styles6.quantityControl}>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(product, "decrease")}
                  style={styles6.button}
                >
                  <Text style={{ fontSize: 20, color: "#000" }}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18, marginHorizontal: 15 }}>
                  {product.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => handleQuantityChange(product, "increase")}
                  style={styles6.button}
                >
                  <Text style={{ fontSize: 20, color: "#000" }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {Object.keys(cart).length > 0 && (
        <View style={styles6.checkoutContainer}>
          <Text style={styles6.totalText}>Total: ${totalPrice.toFixed(2)}</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("CheckoutPage")}
            style={styles6.checkoutButton}
          >
            <Text
              style={{
                color: "#000",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Go to Checkout
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// Styling
const styles6 = StyleSheet.create({
  productContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  checkoutContainer: {
    marginTop: 20,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 5,
    width: "70%",
  },
});

const CheckoutPage = () => {
  const { cart } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState("VISA");

  const totalPrice = Object.values(cart).reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  const handleConfirmOrder = () => {
    Alert.alert(
      "Order Confirmed",
      `Payment method: ${paymentMethod}\nTotal: $${totalPrice.toFixed(2)}`
    );
    // Here you can trigger an API call to place the order
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, backgroundColor: "#f5f5f5" }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
          color: "#333",
        }}
      >
        Checkout
      </Text>

      {/* Payment Method Section */}
      <Text style={{ fontSize: 18, marginBottom: 10, color: "#333" }}>
        Select Payment Method:
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 20,
          borderColor: "#ccc",
          backgroundColor: "#fff",
        }}
      >
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value)}
        >
          <Picker.Item label="VISA" value="VISA" />
          <Picker.Item label="MasterCard" value="MASTERCARD" />
          <Picker.Item label="PayPal" value="PAYPAL" />
          <Picker.Item label="Apple Pay" value="APPLE_PAY" />
          <Picker.Item label="Cash on Delivery" value="COD" />
        </Picker>
      </View>

      {/* Order Summary Section */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          color: "#333",
        }}
      >
        Order Summary
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          padding: 15,
          marginBottom: 20,
          elevation: 5, // Shadow effect for Android
          shadowColor: "#000", // Shadow effect for iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        {Object.values(cart).map((product) => (
          <View
            key={product._id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, color: "#333" }}>{product.name}</Text>
            <Text style={{ fontSize: 16, color: "#555" }}>
              {product.quantity} x ${product.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total Price Section */}
      <View
        style={{
          backgroundColor: "#4c97af",
          borderRadius: 8,
          padding: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
          Total: ${totalPrice.toFixed(2)}
        </Text>
      </View>

      {/* Confirm Order Button */}
      <TouchableOpacity
        onPress={handleConfirmOrder}
        style={{
          backgroundColor: "#4CAF50",
          padding: 16,
          borderRadius: 5,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <Text
          style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
        >
          Confirm Order
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ProductDetails = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          "https://3.223.57.90/getSpecificProduct",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420",
            },
            body: JSON.stringify({ product_id: productId }),
          }
        );

        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          Alert.alert("Error", data.message || "Could not fetch product");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        Alert.alert("Error", "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!product) {
    return <Text style={{ marginTop: 50 }}>Product not found.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles8.container}>
      {/* Product Image (optional) */}
      {product.image && (
        <Image source={{ uri: product.image }} style={styles8.productImage} />
      )}

      <Text style={styles8.productName}>{product.name}</Text>

      <Text style={styles8.productDescription}>{product.description}</Text>

      <Text style={styles8.productPrice}>${product.price}</Text>

      {/* Add additional elements here like category, etc. */}
    </ScrollView>
  );
};

// Enhanced Styling (styles8)
const styles8 = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
  },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 30,
  },
});

const GameScreen = ({ route }) => {
  const [pressure, setPressure] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [subscription, setSubscription] = useState(null);

  // Fetching the barometer data using expo-sensors
  const subscribeToBarometer = () => {
    const subscription = Barometer.addListener((data) => {
      console.log("Barometer data: ", data); // Add logging to check if data is coming through
      setPressure(data.pressure);
      setAltitude(data.relativeAltitude); // Only available on iOS
    });
    setSubscription(subscription);
  };

  const unsubscribeFromBarometer = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    subscribeToBarometer();
    return () => {
      unsubscribeFromBarometer();
    };
  }, []);

  return (
    <View style={styles4.container}>
      <Text style={styles4.header}>Game - Barometer Data</Text>
      <Text style={styles4.text}>Pressure: {pressure} hPa</Text>
      <Text style={styles4.text}>
        Relative Altitude:{" "}
        {Platform.OS === "ios" ? `${altitude} m` : "Only available on iOS"}
      </Text>
    </View>
  );
};

const styles4 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
});


const MapScreen = ({ route, navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    };

    getLocation();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles9.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles9.container}>
        <Text>Loading your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles9.container}>
      <Text style={styles9.header}>Your Location</Text>
      <Text>Latitude: {location.coords.latitude}</Text>
      <Text>Longitude: {location.coords.longitude}</Text>

      {/* Render Google Map with Marker */}
      <MapView
        style={styles9.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Your Location"
          description="You are here"
        />
      </MapView>
    </View>
  );
};

const styles9 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '80%',
  },
});