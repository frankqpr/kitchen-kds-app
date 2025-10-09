import React, { useMemo, useState, useEffect } from "react";

export type ServiceType = "Dine-In" | "Takeout" | "Delivery";
export type OrderStatus = "New" | "In Progress" | "Ready" | "Completed";

interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
}

interface Order {
  id: string;
  status: OrderStatus;
  serviceType: ServiceType;
  table?: string;
  promisedFor: string;
  placedAt: string;
  items: OrderItem[];
  specialRequest?: string;
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: "1042",
    status: "New",
    serviceType: "Dine-In",
    table: "T12",
    placedAt: "2023-10-09T11:04:00",
    promisedFor: "2023-10-09T11:16:00",
    items: [
      { name: "Smoked Brisket Sandwich", quantity: 2, modifiers: ["Pickles", "No onions"] },
      { name: "Loaded Fries", quantity: 1 },
    ],
    specialRequest: "Allergy: peanuts",
  },
  {
    id: "1043",
    status: "In Progress",
    serviceType: "Takeout",
    placedAt: "2023-10-09T10:58:00",
    promisedFor: "2023-10-09T11:15:00",
    items: [
      { name: "Grilled Salmon Bowl", quantity: 1, modifiers: ["Brown rice"] },
      { name: "Kale Caesar Salad", quantity: 1 },
    ],
  },
  {
    id: "1044",
    status: "New",
    serviceType: "Delivery",
    placedAt: "2023-10-09T11:07:00",
    promisedFor: "2023-10-09T11:35:00",
    items: [
      { name: "Margherita Pizza", quantity: 2 },
      { name: "Caprese Skewers", quantity: 1 },
    ],
    specialRequest: "Cut pizza into squares",
  },
  {
    id: "1045",
    status: "In Progress",
    serviceType: "Dine-In",
    table: "T3",
    placedAt: "2023-10-09T10:49:00",
    promisedFor: "2023-10-09T11:10:00",
    items: [
      { name: "Thai Curry", quantity: 3, modifiers: ["Medium spice"] },
      { name: "Steamed Jasmine Rice", quantity: 3 },
    ],
  },
  {
    id: "1046",
    status: "Ready",
    serviceType: "Delivery",
    placedAt: "2023-10-09T10:41:00",
    promisedFor: "2023-10-09T11:05:00",
    items: [
      { name: "BBQ Chicken Wings", quantity: 2 },
      { name: "Garden Salad", quantity: 2, modifiers: ["Dressing on the side"] },
    ],
  },
  {
    id: "1047",
    status: "Ready",
    serviceType: "Takeout",
    placedAt: "2023-10-09T10:37:00",
    promisedFor: "2023-10-09T11:00:00",
    items: [
      { name: "Classic Burger", quantity: 2, modifiers: ["Medium", "Extra pickles"] },
      { name: "Sweet Potato Fries", quantity: 2 },
    ],
    specialRequest: "Add ketchup packets",
  },
  {
    id: "1048",
    status: "Completed",
    serviceType: "Dine-In",
    table: "T8",
    placedAt: "2023-10-09T10:11:00",
    promisedFor: "2023-10-09T10:32:00",
    items: [
      { name: "Miso Ramen", quantity: 1 },
      { name: "Gyoza", quantity: 1 },
    ],
  },
];

const STATUS_ORDER: OrderStatus[] = ["New", "In Progress", "Ready", "Completed"];
const FILTERS: (ServiceType | "All")[] = ["All", "Dine-In", "Takeout", "Delivery"];

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getElapsedMinutes = (start: string, now: Date) => {
  const startDate = new Date(start);
  return Math.floor((now.getTime() - startDate.getTime()) / 1000 / 60);
};

const isLate = (promisedFor: string, now: Date) => new Date(promisedFor).getTime() < now.getTime();

const KitchenKDSApp: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "All") {
      return SAMPLE_ORDERS;
    }
    return SAMPLE_ORDERS.filter((order) => order.serviceType === filter);
  }, [filter]);

  const groupedOrders = useMemo(() => {
    return STATUS_ORDER.reduce<Record<OrderStatus, Order[]>>((acc, status) => {
      acc[status] = filteredOrders.filter((order) => order.status === status);
      return acc;
    }, {
      New: [],
      "In Progress": [],
      Ready: [],
      Completed: [],
    });
  }, [filteredOrders]);

  const summary = useMemo(() => {
    const totals = STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = filteredOrders.filter((order) => order.status === status).length;
        return acc;
      },
      {
        New: 0,
        "In Progress": 0,
        Ready: 0,
        Completed: 0,
      } as Record<OrderStatus, number>
    );

    const overdue = filteredOrders.filter((order) => isLate(order.promisedFor, now)).length;
    return {
      total: filteredOrders.length,
      ...totals,
      overdue,
    };
  }, [filteredOrders, now]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Kitchen Display</h1>
          <p className="header__subtitle">Monitor orders in real-time and keep your line moving.</p>
        </div>
        <div className="header__meta">
          <span className="header__clock">{formatTime(now)}</span>
          <span className="header__date">{now.toLocaleDateString()}</span>
        </div>
      </header>

      <section className="summary">
        <article className="summary__card">
          <span className="summary__value">{summary.total}</span>
          <span className="summary__label">Total Orders</span>
        </article>
        <article className="summary__card">
          <span className="summary__value">{summary["New"]}</span>
          <span className="summary__label">New</span>
        </article>
        <article className="summary__card">
          <span className="summary__value">{summary["In Progress"]}</span>
          <span className="summary__label">Cooking</span>
        </article>
        <article className="summary__card">
          <span className="summary__value">{summary.Ready}</span>
          <span className="summary__label">Ready to Serve</span>
        </article>
        <article className="summary__card summary__card--alert">
          <span className="summary__value">{summary.overdue}</span>
          <span className="summary__label">Overdue</span>
        </article>
      </section>

      <nav className="filters" aria-label="Order type filters">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            className={option === filter ? "filters__button filters__button--active" : "filters__button"}
            onClick={() => setFilter(option)}
          >
            {option}
          </button>
        ))}
      </nav>

      <section className="status-grid">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="status-column">
            <div className="status-column__header">
              <h2>{status}</h2>
              <span>{groupedOrders[status].length}</span>
            </div>
            <div className="status-column__orders">
              {groupedOrders[status].length === 0 ? (
                <p className="status-column__empty">No orders</p>
              ) : (
                groupedOrders[status].map((order) => {
                  const late = isLate(order.promisedFor, now) && status !== "Completed";
                  const elapsed = getElapsedMinutes(order.placedAt, now);
                  return (
                    <article
                      key={order.id}
                      className={late ? "order-card order-card--late" : "order-card"}
                    >
                      <header className="order-card__header">
                        <span className="order-card__id">#{order.id}</span>
                        <span className={`order-card__service order-card__service--${order.serviceType.toLowerCase().replace("-", "")}`}>
                          {order.serviceType}
                        </span>
                      </header>

                      <div className="order-card__meta">
                        {order.table && <span className="order-card__tag">{order.table}</span>}
                        <span className="order-card__tag order-card__tag--muted">
                          {elapsed} min ago
                        </span>
                        <span className="order-card__tag order-card__tag--due">
                          Due {formatTime(new Date(order.promisedFor))}
                        </span>
                      </div>

                      <ul className="order-card__items">
                        {order.items.map((item) => (
                          <li key={`${order.id}-${item.name}`}>
                            <span className="order-card__item-quantity">{item.quantity}×</span>
                            <div>
                              <p className="order-card__item-name">{item.name}</p>
                              {item.modifiers && (
                                <p className="order-card__item-modifiers">{item.modifiers.join(", ")}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      {order.specialRequest && (
                        <p className="order-card__note">{order.specialRequest}</p>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default KitchenKDSApp;
