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