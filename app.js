const FIREBASE_PROJECT_ID = "kasi-stock-mate";
const FIREBASE_API_KEY = "AIzaSyDBuoCSg-QbyZ3NT5qC-TW6ey3fotSJVUA";
const FIRESTORE_BASE_URL =
  "https://firestore.googleapis.com/v1/projects/" +
  FIREBASE_PROJECT_ID +
  "/databases/(default)/documents";

const stock = {
  loaves: { label: "Quarter Loaves", opening: 0, used: 0, remaining: 0 },
  chips: { label: "Chips Portions", opening: 0, used: 0, remaining: 0 },
  fishFillets: { label: "Fish Fillets", opening: 0, used: 0, remaining: 0 },
  karapau: { label: "Karapau", opening: 0, used: 0, remaining: 0 },
  russians: { label: "Russians", opening: 0, used: 0, remaining: 0 },
  viennas: { label: "Viennas", opening: 0, used: 0, remaining: 0 },
  eggs: { label: "Eggs", opening: 0, used: 0, remaining: 0 },
  cheese: { label: "Cheese Slices", opening: 0, used: 0, remaining: 0 },
  polony: { label: "Polony Slices", opening: 0, used: 0, remaining: 0 },
  bacon: { label: "Bacon Slices", opening: 0, used: 0, remaining: 0 },
  ham: { label: "Ham Slices", opening: 0, used: 0, remaining: 0 },
  tortillas: { label: "Tortilla Wraps", opening: 0, used: 0, remaining: 0 },
  lettuce: { label: "Lettuce Portions", opening: 0, used: 0, remaining: 0 },
  tomato: { label: "Tomato Slices", opening: 0, used: 0, remaining: 0 },
  sauce: { label: "Sauce Portions", opening: 0, used: 0, remaining: 0 }
};

const menuItems = [
  {
    name: "Kota Special",
    price: 20,
    needsFryer: true,
    ingredients: { loaves: 1, chips: 1, polony: 1, cheese: 1, eggs: 1 }
  },
  {
    name: "Kota Bacon & Egg",
    price: 30,
    needsFryer: true,
    ingredients: { loaves: 1, chips: 1, bacon: 1, eggs: 1, cheese: 1 }
  },
  {
    name: "Kota Supreme",
    price: 40,
    needsFryer: true,
    ingredients: { loaves: 1, chips: 1, bacon: 1, ham: 1, cheese: 1, viennas: 1, eggs: 1 }
  },
  {
    name: "Kota Ultimate",
    price: 50,
    needsFryer: true,
    ingredients: {
      loaves: 1,
      chips: 1,
      bacon: 1,
      viennas: 1,
      ham: 1,
      russians: 1,
      eggs: 1,
      cheese: 1
    }
  },
  {
    name: "Fish & Chips",
    price: 60,
    needsFryer: true,
    ingredients: { fishFillets: 1, chips: 1 }
  },
  {
    name: "Karapau & Chips",
    price: 75,
    needsFryer: true,
    ingredients: { karapau: 1, chips: 1 }
  },
  {
    name: "Russian Wrap & Chips",
    price: 40,
    needsFryer: true,
    ingredients: {
      tortillas: 1,
      russians: 1,
      chips: 1,
      lettuce: 1,
      tomato: 1,
      sauce: 1
    }
  },
  {
    name: "Extra Russian",
    price: 15,
    needsFryer: true,
    ingredients: { russians: 1 }
  }
];

function withApiKey(url) {
  return url + "?key=" + encodeURIComponent(FIREBASE_API_KEY);
}

function toFirestoreField(value) {
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    const arr = [];
    for (let i = 0; i < value.length; i++) {
      arr.push(toFirestoreField(value[i]));
    }
    return { arrayValue: { values: arr } };
  }
  if (value && typeof value === "object") {
    const fields = {};
    for (const k in value) {
      fields[k] = toFirestoreField(value[k]);
    }
    return { mapValue: { fields: fields } };
  }
  return { stringValue: String(value) };
}

function fromFirestoreField(field) {
  if (!field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("booleanValue" in field) return field.booleanValue;
  if ("arrayValue" in field) {
    const rawValues = field.arrayValue.values || [];
    const out = [];
    for (let i = 0; i < rawValues.length; i++) {
      out.push(fromFirestoreField(rawValues[i]));
    }
    return out;
  }
  if ("mapValue" in field) {
    const rawFields = field.mapValue.fields || {};
    const obj = {};
    for (const k in rawFields) {
      obj[k] = fromFirestoreField(rawFields[k]);
    }
    return obj;
  }
  return null;
}

function saveStockToFirestore(key) {
  const item = stock[key];
  if (!item) return;

  const docUrl = withApiKey(
    FIRESTORE_BASE_URL + "/counter_stock/" + encodeURIComponent(key)
  );

  fetch(docUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        label: toFirestoreField(item.label),
        opening: toFirestoreField(item.opening),
        used: toFirestoreField(item.used),
        remaining: toFirestoreField(item.remaining)
      }
    })
  }).catch(function (err) {
    console.log("Error saving stock to Firestore:", err);
  });
}

function loadStockFromFirestore() {
  const listUrl = withApiKey(FIRESTORE_BASE_URL + "/counter_stock");

  fetch(listUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      const docs = data.documents || [];

      if (docs.length === 0) {
        for (const key in stock) {
          saveStockToFirestore(key);
        }
        return;
      }

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const parts = doc.name.split("/");
        const docKey = parts[parts.length - 1];
        const fields = doc.fields || {};

        if (stock[docKey]) {
          stock[docKey].label = fromFirestoreField(fields.label) || stock[docKey].label;
          stock[docKey].opening = Number(fromFirestoreField(fields.opening) || 0);
          stock[docKey].used = Number(fromFirestoreField(fields.used) || 0);
          stock[docKey].remaining = Number(fromFirestoreField(fields.remaining) || 0);
        }
      }

      renderStockTable();
    })
    .catch(function (err) {
      console.log("Error loading stock from Firestore:", err);
    });
}

function renderCompletedOrders(orders) {
  const salesList = document.getElementById("sales-list");
  salesList.innerHTML = "";

  if (!Array.isArray(orders) || orders.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No completed orders saved yet.";
    salesList.appendChild(empty);
    return;
  }

  let totalRevenue = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    totalRevenue = totalRevenue + Number(order.total || 0);

    const card = document.createElement("div");
    card.className = "order-card";

    const title = document.createElement("h4");
    title.textContent = "Order #" + order.orderNumber + " — R" + order.total;

    const itemsText = document.createElement("p");
    const itemsArray = Array.isArray(order.items) ? order.items : [];
    itemsText.textContent = "Sold: " + itemsArray.join(", ");

    card.appendChild(title);
    card.appendChild(itemsText);
    salesList.appendChild(card);
  }

  const summary = document.createElement("p");
  summary.innerHTML = "<strong>Total Recorded Sales: R" + totalRevenue + "</strong>";
  salesList.insertBefore(summary, salesList.firstChild);
}

function loadCompletedOrdersFromFirestore() {
  const ordersUrl = withApiKey(FIRESTORE_BASE_URL + "/completed_orders");

  fetch(ordersUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      const docs = data.documents || [];
      const orders = [];

      for (let i = 0; i < docs.length; i++) {
        const f = docs[i].fields || {};
        orders.push({
          orderNumber: fromFirestoreField(f.orderNumber),
          items: fromFirestoreField(f.items) || [],
          total: fromFirestoreField(f.total) || 0,
          hasFryer: Boolean(fromFirestoreField(f.hasFryer))
        });
      }

      orders.reverse();
      renderCompletedOrders(orders);
    })
    .catch(function (err) {
      console.log("Error loading completed orders:", err);
    });
}

function saveCompletedOrderToFirestore(order) {
  const soldItemNames = [];
  for (let i = 0; i < order.items.length; i++) {
    soldItemNames.push(order.items[i].name);
  }

  const createOrderUrl = withApiKey(FIRESTORE_BASE_URL + "/completed_orders");

  fetch(createOrderUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        orderNumber: toFirestoreField(order.number),
        items: toFirestoreField(soldItemNames),
        total: toFirestoreField(order.total),
        hasFryer: toFirestoreField(order.hasFryer),
        ingredientsUsed: toFirestoreField(order.needed),
        completedAt: toFirestoreField(new Date().toISOString())
      }
    })
  })
    .then(function () {
      if (isOwnerLoggedIn) {
        loadCompletedOrdersFromFirestore();
      }
    })
    .catch(function (err) {
      console.log("Error saving completed order:", err);
    });
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".view-section");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.view;

      buttons.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });
}
setupTabs();

function renderStockTable() {
  const tableBody = document.getElementById("stock-table-body");
  tableBody.innerHTML = "";

  for (const key in stock) {
    const item = stock[key];
    const row = document.createElement("tr");

    if (item.remaining <= 5) {
      row.classList.add("low-stock");
    }

    const nameCell = document.createElement("td");
    nameCell.textContent = item.label;

    const openingCell = document.createElement("td");
    openingCell.textContent = item.opening;

    const usedCell = document.createElement("td");
    usedCell.textContent = item.used;

    const remainingCell = document.createElement("td");
    remainingCell.textContent = item.remaining;

    const actionCell = document.createElement("td");

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.placeholder = "Qty";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "secondary-btn";
    addButton.textContent = "Add";

    addButton.addEventListener("click", function () {
      const amount = Number(qtyInput.value);

      if (isNaN(amount) || amount <= 0) {
        return;
      }

      item.opening = item.opening + amount;
      item.remaining = item.opening - item.used;
      qtyInput.value = "";
      renderStockTable();
      saveStockToFirestore(key);
    });

    actionCell.appendChild(qtyInput);
    actionCell.appendChild(addButton);

    row.appendChild(nameCell);
    row.appendChild(openingCell);
    row.appendChild(usedCell);
    row.appendChild(remainingCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  }
}
renderStockTable();

const currentOrder = [];

function renderMenu() {
  const menuGrid = document.getElementById("menu-list");
  menuGrid.innerHTML = "";

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];

    const card = document.createElement("div");
    card.className = "menu-card";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = "R" + item.price;

    const fryerTag = document.createElement("small");
    if (item.needsFryer) {
      fryerTag.textContent = "Uses Fryer";
    } else {
      fryerTag.textContent = "No Fryer";
    }

    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(fryerTag);

    card.addEventListener("click", function () {
      currentOrder.push(item);
      renderCurrentOrder();
    });

    menuGrid.appendChild(card);
  }
}
renderMenu();

function renderCurrentOrder() {
  const orderList = document.getElementById("current-order-list");
  orderList.innerHTML = "";

  if (currentOrder.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "No items selected yet.";
    orderList.appendChild(emptyItem);
    return;
  }

  for (let i = 0; i < currentOrder.length; i++) {
    const item = currentOrder[i];

    const listItem = document.createElement("li");
    listItem.textContent = item.name + " - R" + item.price + " ";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "secondary-btn";
    removeBtn.textContent = "Remove";

    removeBtn.addEventListener("click", function () {
      currentOrder.splice(i, 1);
      renderCurrentOrder();
    });

    listItem.appendChild(removeBtn);
    orderList.appendChild(listItem);
  }
}
renderCurrentOrder();

const activeOrders = [];
let orderNumber = 1;

function getNeededIngredients(orderItems) {
  const needed = {};

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    for (const ingKey in item.ingredients) {
      const qty = item.ingredients[ingKey];
      if (!needed[ingKey]) {
        needed[ingKey] = 0;
      }
      needed[ingKey] = needed[ingKey] + qty;
    }
  }

  return needed;
}

function renderActiveOrders() {
  const ordersContainer = document.getElementById("active-orders-list");
  ordersContainer.innerHTML = "";

  if (activeOrders.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-state";
    emptyMsg.textContent = "No active orders.";
    ordersContainer.appendChild(emptyMsg);
    return;
  }

  for (let i = 0; i < activeOrders.length; i++) {
    const order = activeOrders[i];

    const card = document.createElement("div");
    card.className = "order-card";

    const heading = document.createElement("h4");
    heading.textContent = "Order #" + order.number + " — R" + order.total;
    card.appendChild(heading);

    if (order.hasFryer) {
      const banner = document.createElement("div");
      banner.className = "fryer-banner";
      banner.textContent = "Fryer Needed";
      card.appendChild(banner);
    }

    const itemsList = document.createElement("ul");
    for (let j = 0; j < order.items.length; j++) {
      const li = document.createElement("li");
      li.textContent = order.items[j].name + " (R" + order.items[j].price + ")";
      itemsList.appendChild(li);
    }
    card.appendChild(itemsList);

    const completeBtn = document.createElement("button");
    completeBtn.type = "button";
    completeBtn.className = "primary-btn";
    completeBtn.textContent = "Complete Order";

    completeBtn.addEventListener("click", function () {
      for (const ingKey in order.needed) {
        const usedQty = order.needed[ingKey];
        stock[ingKey].used = stock[ingKey].used + usedQty;
        stock[ingKey].remaining = stock[ingKey].opening - stock[ingKey].used;
        saveStockToFirestore(ingKey);
      }

      activeOrders.splice(i, 1);
      saveCompletedOrderToFirestore(order);
      renderActiveOrders();
      renderStockTable();
    });

    card.appendChild(completeBtn);
    ordersContainer.appendChild(card);
  }
}

function setupPlaceOrder() {
  const placeBtn = document.getElementById("place-order-btn");
  const feedback = document.getElementById("order-feedback");

  placeBtn.addEventListener("click", function () {
    feedback.textContent = "";

    if (currentOrder.length === 0) {
      feedback.textContent = "Select at least one menu item first.";
      return;
    }

    const needed = getNeededIngredients(currentOrder);

    for (const ingKey in needed) {
      const requiredQty = needed[ingKey];
      const availableQty = stock[ingKey].remaining;

      if (availableQty < requiredQty) {
        feedback.textContent =
          "Not enough " +
          stock[ingKey].label +
          " in counter (need " +
          requiredQty +
          ", have " +
          availableQty +
          ").";
        return;
      }
    }

    let total = 0;
    let hasFryer = false;
    const copiedItems = [];

    for (let i = 0; i < currentOrder.length; i++) {
      const item = currentOrder[i];
      total = total + item.price;
      if (item.needsFryer) {
        hasFryer = true;
      }
      copiedItems.push(item);
    }

    activeOrders.push({
      number: orderNumber,
      items: copiedItems,
      total: total,
      hasFryer: hasFryer,
      needed: needed
    });

    orderNumber = orderNumber + 1;
    currentOrder.length = 0;

    renderCurrentOrder();
    renderActiveOrders();
  });
}

renderActiveOrders();
setupPlaceOrder();

let isOwnerLoggedIn = false;
const OWNER_LOGIN_PIN = "1234";

function setupOwnerLogin() {
  const ownerSection = document.getElementById("owner-view");
  const ownerTabBtn = document.getElementById("tab-owner");
  const tableWrap = ownerSection.querySelector(".table-wrap");

  const loginBox = document.createElement("div");
  loginBox.id = "owner-login-box";
  loginBox.className = "login-box";

  const heading = document.createElement("h3");
  heading.textContent = "Owner Login";

  const instructions = document.createElement("p");
  instructions.textContent = "Log in with your owner PIN to manage counter stock and view sales.";

  const pinInput = document.createElement("input");
  pinInput.type = "password";
  pinInput.placeholder = "Enter Owner PIN";

  const loginBtn = document.createElement("button");
  loginBtn.type = "button";
  loginBtn.className = "primary-btn";
  loginBtn.textContent = "Log In";

  const statusMsg = document.createElement("p");
  statusMsg.className = "feedback";

  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "secondary-btn logout-btn";
  logoutBtn.textContent = "Log Out";

  const salesPanel = document.createElement("div");
  salesPanel.id = "owner-sales-panel";
  salesPanel.className = "sales-panel";
  salesPanel.innerHTML =
    "<h3>Completed Orders (Sold Today)</h3><div id='sales-list'><p class='empty-state'>No completed orders loaded yet.</p></div>";

  function refreshOwnerView() {
    if (isOwnerLoggedIn) {
      loginBox.style.display = "none";
      logoutBtn.style.display = "inline-block";
      tableWrap.style.display = "block";
      salesPanel.style.display = "block";
      loadCompletedOrdersFromFirestore();
    } else {
      loginBox.style.display = "block";
      logoutBtn.style.display = "none";
      tableWrap.style.display = "none";
      salesPanel.style.display = "none";
      pinInput.value = "";
      statusMsg.textContent = "";
    }
  }

  loginBtn.addEventListener("click", function () {
    if (pinInput.value === OWNER_LOGIN_PIN) {
      isOwnerLoggedIn = true;
      statusMsg.textContent = "";
      refreshOwnerView();
    } else {
      statusMsg.textContent = "Wrong owner PIN. Only the shop owner can access this page.";
    }
  });

  logoutBtn.addEventListener("click", function () {
    isOwnerLoggedIn = false;
    refreshOwnerView();
  });

  ownerTabBtn.addEventListener("click", function () {
    refreshOwnerView();
  });

  loginBox.appendChild(heading);
  loginBox.appendChild(instructions);
  loginBox.appendChild(pinInput);
  loginBox.appendChild(loginBtn);
  loginBox.appendChild(statusMsg);

  ownerSection.insertBefore(loginBox, tableWrap);
  ownerSection.insertBefore(logoutBtn, tableWrap);
  ownerSection.appendChild(salesPanel);

  refreshOwnerView();
}

setupOwnerLogin();
loadStockFromFirestore();