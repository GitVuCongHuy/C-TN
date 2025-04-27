function Add_To_Card({ props, cart, setCart }) {
  const existingItem = cart.find(cartItem => cartItem.productId === props.productId);
  if (existingItem) {
    const newQuantity = existingItem.quantity ? existingItem.quantity + 1 : 1;
    console.log(newQuantity);
    Change_quantity({ props, quantity: newQuantity, cart, setCart });
  } else {
    setCart([...cart, { ...props, quantity: 1 }]);
  }
}
function Add_To_Card_Menu({ product, cart, setCart }) {
  const existingItem = cart.find(cartItem => cartItem.productId === product.productId);
  if (existingItem) {
    const newQuantity = existingItem.quantity ? existingItem.quantity + 1 : 1;
    console.log(newQuantity);
    const props = product
    Change_quantity({ props, quantity: newQuantity, cart, setCart });
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }
}
function Change_quantity({ props, quantity, cart, setCart }) {

  const numericQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  const updatedCart = cart.map(cartItem => {
    if (cartItem.productId === props.productId) {
      return { ...cartItem, quantity: numericQuantity };
    }
    return cartItem;
  });
  setCart(updatedCart);
}

function Delete_Card({ props, cart, setCart }) {
  const updatedCart = cart.filter(cartItem => cartItem.productId !== props.productId);
  setCart(updatedCart);
}
export { Add_To_Card, Change_quantity, Delete_Card, Add_To_Card_Menu }

