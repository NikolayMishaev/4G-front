import { useState , useEffect } from "react";
import "./App.css";
import { getOrdersServer,updateOrderServer } from "../../utils/OrdersAPI";

function App() {
  const [pallets, setPallets] = useState([]);

  const [activePallet, setActivePallet] = useState({});

  const [currentOrder, setCurrentOrder] = useState({})

  const [orders, setOrders] = useState([]);

  function handleSelectPallet(e) {
    activePallet.classList?.remove("activePallet");
    if (e.target == activePallet) {
      setActivePallet({});
      return;
    }
    if (
      e.target.classList.contains("mono") ||
      e.target.classList.contains("mix")
    ) {
      setActivePallet(e.target);
      e.target.classList.add("activePallet");
    }
  }

  function handleChangeStatus(e) {
    const newStatus = e.target.value;
    if (activePallet.classList) {
      const isMono = activePallet.classList.contains("mono");
      const status = isMono ? "statusMono" : "statusMix";
      const selectedPalletNumber = activePallet.parentNode.value;
      setPallets(
        pallets.map((pallet) => {
          if (+pallet.number !== selectedPalletNumber) return pallet;
          else return { ...pallet, [status]: newStatus || 0 };
        })
      );
    }
    activePallet.classList?.remove("activePallet");
    setActivePallet({});
  }

    useEffect(() => {
      getOrders()
        setInterval(getOrders,5000)
    }, []);

    useEffect(() => {
      if (pallets.length) updateOrderServer(currentOrder.orderID, {pallets : pallets}).then(data=>console.log(data))
      setOrders(orders.map((order => {
        if (order.id !== currentOrder.orderID) return order;
        else return { ...order, pallets}
      })))
    }, [pallets]);

  function getOrders() {
    getOrdersServer().then(orders => {
      if (Array.isArray(orders)) {
        setOrders(orders.sort((a, b) => a.id - b.id))
      }
      console.log(orders)
    }).catch(error => console.log(error))
  }

  function handleSelectOrder(e) {
    const selectedOrder = orders.find(order => order.id == e.target.parentNode.value)
    setPallets(selectedOrder.pallets)
    setCurrentOrder({orderName: `00УТ-00${selectedOrder.number} ${selectedOrder.marketplace}`,
    orderID: selectedOrder.id})
  }

  const viewPallets = pallets.map((pallet, i) => (
    <li
      onClick={handleSelectPallet}
      key={i}
      value={i + 1}
      className={`progress__list ${
        pallet.statusMono == 1 && pallet.statusMix == 1 ? "status-1" : ""
      }`}
    >
      <p className="progress__item">{pallet.number}</p>
      <p className={`progress__item status-${pallet.statusMono} mono`}>
        {pallet.mono}
      </p>
      <p className={`progress__item status-${pallet.statusMix} mix`}>
        {pallet.mix}
      </p>
      <p className="progress__item">{pallet.withoutDM}</p>
      <p className="progress__item">{pallet.SUMM}</p>
      <p className="progress__item progress__item_last">{pallet.storeKeeper}</p>
    </li>
  ));

  const viewOrders = orders.map((order, i) => (
    <li className="ordersContainer__list" key={i} value={order.id}>
      <p className="ordersContainer__item" onClick={handleSelectOrder}>{`00УТ-00${order.number}`}</p>
      <p className="ordersContainer__item ordersContainer__item_date">{order.date}</p>
      <p className="ordersContainer__item ordersContainer__item_market">{order.marketplace}</p>
      <p className="ordersContainer__item">{order.sku}</p>
      <p className="ordersContainer__item">{order.plan}</p>
      <p className="ordersContainer__item">{order.fact}</p>
      <div className="ordersContainer__item ordersContainer__item_last"><div className="ordersContainer__wrapper">{`${Math.min((order.fact/order.plan*100).toFixed(2), 100)}%`}<div className="ordersContainer__bar" style={{width: `${order.fact/order.plan*100}%`}}></div></div></div>
    </li>
  ));

  return (
    <div className="body">
      <div className="orderPanel">
        <div className="orderTitle">
          <p className="orderTitle__item" style={{minWidth:"110px"}}>Отгрузка</p>
          <p className="orderTitle__item" style={{minWidth:"55px"}}>Дата</p>
          <p className="orderTitle__item" style={{minWidth:"80px"}}>Склад</p>
          <p className="orderTitle__item">Кол-во SKU</p>
          <p className="orderTitle__item">Кол-во план</p>
          <p className="orderTitle__item">Кол-во факт</p>
          <p className="orderTitle__item orderTitle__item_last">
            Прогресс выполнения
          </p>
        </div>
        <ul className="ordersContainer">{viewOrders}</ul>
      </div>
      <div className="progressPanel">
        <div className="progress">
          <h2 className="progress__header">{currentOrder.orderName || `выберите отгрузку`}</h2>
          {currentOrder.orderName ? <div className="progress__title">
            <p className="progress__item">палет</p>
            <p className="progress__item">моно</p>
            <p className="progress__item">микс</p>
            <p className="progress__item">без чз</p>
            <p className="progress__item">всего</p>
            <p className="progress__item progress__item_last">кладовщик</p>
          </div> : ''}
          <ul className="progress__container">{viewPallets}</ul>
        </div>
        <div className="statuses">
          <h2
            className="statuses__header status-box"
            value="0"
            onClick={handleChangeStatus}
          >
            Статусы
          </h2>
          <ul className="statuses__container">
            <li
              className="status-2 status-box"
              value="2"
              onClick={handleChangeStatus}
            >
              В контур
            </li>
            <li
              className="status-3 status-box"
              value="3"
              onClick={handleChangeStatus}
            >
              ждем гис мт
            </li>
            <li
              className="status-1 status-box"
              value="1"
              onClick={handleChangeStatus}
            >
              готов
            </li>
            <li
              className="status-4 status-box"
              value="4"
              onClick={handleChangeStatus}
            >
              ошибка ЧЗ
            </li>
            <li
              className="status-5 status-box"
              value="5"
              onClick={handleChangeStatus}
            >
              ошибка в контуре
            </li>
            <li
              className="status-6 status-box"
              value="6"
              onClick={handleChangeStatus}
            >
              ошибка кладовщика
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
