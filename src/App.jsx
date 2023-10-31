import './App.css';
import Loading from './app/Loading';
import DevTool from './app/DevTool';
import Orders from './features/order/Orders';
import Items from './features/item/Items';
import { useIsLoading } from './features/api/utils';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
  const isLoading = useIsLoading();
  return (
    <div className="App">
      { isLoading && <Loading />}
      <h1>Orders</h1>
      <Orders />
      <h1>Items</h1>
      <Items />
      <DevTool />
    </div>
  );
}

export default App;
