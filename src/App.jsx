import './App.css';
import Orders from './features/order/Orders';
import Items from './features/item/Items';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
  return (
    <div className="App">
      <h1>Orders</h1>
      <Orders />
      <h1>Items</h1>
      <Items />
    </div>
  );
}

export default App;
