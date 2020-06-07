import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  StyleSheet,
  RefreshControl,
  ToastAndroid,
  Alert,
  YellowBox,
} from "react-native";
import {
  Divider,
  List,
  ListItem,
  Text,
  Icon,
  Button,
  Layout,
  Spinner,
  MenuItem,
  OverflowMenu,
} from "@ui-kitten/components";
import { LocalizationContext } from "../../context";
import { LinearGradient } from "expo-linear-gradient";
import { nextOrderStatus, nextOrderStatusLabels } from "../../utils";
import * as SMS from "expo-sms";

import { OrderModel } from "../../models";
import database from "../../database";
YellowBox.ignoreWarnings(["VirtualizedLists should never be nested"]);
const TrashIcon = (props) => (
  <Icon {...props} name="trash-2-outline" fill="#CA0909" />
);

const order = new OrderModel(database.getDatabase());

const StarIcon = (props) => <Icon {...props} name="external-link" />;

const OrderItem = ({ item, type, onRefresh }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const zoomIconRef = useRef();
  useEffect(() => {
    if (zoomIconRef && zoomIconRef.current) {
      zoomIconRef.current.startAnimation();
    }
  }, []);

  const sendSMS = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [item.CustomersPhone],
        `AOA respected ${item.CustomersName}
        Your order has been completed for ${item.SuiteTypesName} suit.
        Please collect your suit from the shop and pay Amount ${item.SuiteTypesPrice}
        
         محترم ${item.CustomersName}
        آپ کا آرڈر ${item.SuiteTypesName} سوٹ کے لئے مکمل ہوچکا ہے۔
        برائے کرم 500 کی رقم ادا کریں اور دکان سے اپنا سوٹ وصول کریں۔
        `
      );
      console.log({ result });
    } else {
      ToastAndroid.show(
        "There is no SMS support on device",
        ToastAndroid.SHORT
      );
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (status === "completed") {
      await sendSMS();
    }

    if (orderId && status) {
      await order.updateStatus({ id: orderId, order_status: status });
      // navigation.navigate(status);
      ToastAndroid.show(
        `Order status updated to ${status.toUpperCase()}`,
        ToastAndroid.SHORT
      );

      onRefresh();
    }
  };

  const deleteOrderAlert = (item) => {
    Alert.alert(
      "Sure?",
      `Are you sure to delete ${item.CustomersName} Order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Yes", onPress: () => deleteOrder(item.OrdersId) },
      ],
      { cancelable: false }
    );
  };
  const deleteOrder = async (id) => {
    try {
      const response = await order.delete({ id });
      if (response) {
        ToastAndroid.show("Order deleted successfully", ToastAndroid.SHORT);
        onRefresh();
      }
    } catch (error) {
      ToastAndroid.show("Failed to delete order", ToastAndroid.SHORT);
    }
  };

  const renderToggleButton = () => (
    <Icon
      onPress={() => setMenuVisible(true)}
      name="more-vertical-outline"
      width={24}
      height={24}
      fill="#007FCE"
    />
  );
  const onMenuSelect = (index) => {
    setSelectedIndex(index);
    setMenuVisible(false);
  };

  const { OrdersSuiteColors } = item;
  const colors = (String(OrdersSuiteColors) || "")
    .split(",")
    .map((color) => color.trim());
  if (colors.length === 1) {
    colors.push("transparent");
  }
  const renderItemLeft = ({ type, ...props }) => {
    const icons = {
      active: "activity-outline",
      pending: "flag-outline",
      completed: "checkmark-circle-2-outline",
      delivered: "arrowhead-right-outline",
      archived: "clock-outline",
      cancelled: "close-outline",
    };

    const anim = {
      ref: zoomIconRef,
      animationConfig: { cycles: Infinity },
      animation: "pulse",
    };

    return (
      <Icon
        {...props}
        name={icons[type]}
        {...(type === "active" && anim)}
        fill="#00FF00"
      />
    );
  };

  const renderItemRight = () => {
    return (
      <Layout style={styles.rightsidelist}>
        <Layout
          style={{
            marginLeft: 5,
            flex: 2,
            flexDirection: "row",
            backgroundColor: "transparent",
          }}
        >
          {colors.map((clr) => (
            <Layout
              key={`####${clr}- ${Math.random() * 100}`}
              style={{
                width: 8,
                height: 8,
                backgroundColor: clr,
                borderRadius: 1000,
                marginLeft: 1,
              }}
            />
          ))}
        </Layout>
        <Layout
          style={{
            backgroundColor: "transparent",
          }}
        >
          <Text style={styles.custName}>{item.SuiteTypesName}</Text>
        </Layout>
        <Layout style={styles.row}>
          <OverflowMenu
            anchor={renderToggleButton}
            visible={menuVisible}
            selectedIndex={selectedIndex}
            onSelect={onMenuSelect}
            onBackdropPress={() => setMenuVisible(false)}
          >
            <MenuItem
              title={`${nextOrderStatusLabels[type]}`}
              onPress={() =>
                updateOrderStatus(item.OrdersId, nextOrderStatus[type])
              }
              accessoryLeft={(props) =>
                renderItemLeft({ ...props, type: nextOrderStatus[type] })
              }
            />
            <MenuItem
              title="Delete"
              accessoryLeft={TrashIcon}
              status="danger"
              style={styles.deleteMenuItem}
              onPress={() => {
                deleteOrderAlert(item);
              }}
            />

            <MenuItem
              title="Cancel"
              onPress={() => updateOrderStatus(item.OrdersId, "cancelled")}
              accessoryLeft={(props) => (
                <Icon {...props} name="close-outline" fill="#FF0800" />
              )}
            />
            <MenuItem
              title="Archive"
              onPress={() => updateOrderStatus(item.OrdersId, "archived")}
              accessoryLeft={(props) => (
                <Icon {...props} name="clock-outline" fill="#3366FF" />
              )}
            />
          </OverflowMenu>
        </Layout>
      </Layout>
    );
  };

  return (
    <LinearGradient
      colors={colors}
      style={{ padding: 0, margin: 2, borderRadius: 2 }}
      start={[1, 1]}
    >
      <ListItem
        title={`${item.CustomersName} (${item.OrdersNoOfSuites})`}
        description={() => {
          const { SuiteTypesPrice, SuiteTypesDiscount } = item;
          let discountPrice = 0;

          if (!isNaN(Number(SuiteTypesDiscount))) {
            discountPrice =
              (Number(SuiteTypesPrice) / 100) * Number(SuiteTypesDiscount);
          }
          const newPrice = Number(SuiteTypesPrice) - Number(discountPrice);

          return (
            <Layout style={styles.rownalign}>
              <Text
                style={{ fontSize: 12, marginLeft: 10 }}
                appearance={"hint"}
              >{`Amount:`}</Text>

              <Text
                style={{
                  fontSize: 10,
                  marginLeft: 5,
                  textDecorationLine: "line-through",
                  color: "red",
                  ...(!discountPrice && {
                    display: "none",
                  }),
                }}
                appearance={"hint"}
              >{`${SuiteTypesPrice}`}</Text>
              <Text
                style={{ fontSize: 10, marginLeft: 5 }}
                appearance={"hint"}
              >{`${newPrice}/-`}</Text>
            </Layout>
          );
        }}
        accessoryRight={renderItemRight}
        accessoryLeft={(props) => renderItemLeft({ type, ...props })}
        // onPress={() => navigation.navigate("OrderDetail", { order: item })}
      />
    </LinearGradient>
  );
};

const Order = ({ type = undefined }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useContext(LocalizationContext);

  const onRefresh = useCallback(() => {
    if (!refreshing) {
      setRefreshing(true);
      order.get({ order_status: type }).then(({ data: orders = [] }) => {
        setOrders(orders);
        setRefreshing(false);
      });
    }
  }, [refreshing]);

  useEffect(() => {
    onRefresh();
  }, [type]);

  // const onItemSelect = (index) => {
  //   setSelectedIndex(index);
  //   setVisible(false);
  // };

  const OrderList = () => (
    <List
      style={styles.orderlist}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#a8df65", "#edf492"]}
        />
      }
      data={orders || []}
      ItemSeparatorComponent={Divider}
      renderItem={({ item }) => (
        <OrderItem item={item} type={type} onRefresh={onRefresh} />
      )}
    />
  );

  return (
    <Layout style={{ flex: 1, flexDirection: "column" }}>
      {refreshing ? (
        <Layout style={styles.centeredView}>
          <Spinner />
        </Layout>
      ) : orders && orders.length === 0 ? (
        <Layout style={styles.centeredView}>
          <Text>{t("no_orders", { type: t(`${type}_orders`) })}</Text>
        </Layout>
      ) : (
        <OrderList />
      )}
    </Layout>
  );
};

export default Order;

const styles = StyleSheet.create({
  orderlist: {
    flex: 1,
  },
  rightsidelist: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    backgroundColor: "transparent",
  },
  bgimage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },

  deleteMenuItem: {
    color: "red",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  custName: {
    fontSize: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rownalign: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  icon: {
    width: 24,
    height: 24,
  },
});
