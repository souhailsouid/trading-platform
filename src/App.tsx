import React from "react";
import Header from "./components/ui/NavBar/Header";
import { DataProvider } from "./hooks/contexts/DataContext";
import { SymbolProvider } from "./hooks/contexts/SymbolsContext";
import { TableProvider } from "./hooks/contexts/TableContext";

import HomeScreen from "./pages/HomeScreen";
import { MainContainer } from "./styles/GlobalStyles";



function App() {
  return (
    <DataProvider>
      <TableProvider>
        <SymbolProvider>
          <MainContainer>
            <Header />
            <HomeScreen />
          </MainContainer>
        </SymbolProvider>
      </TableProvider>
    </DataProvider>
  );
}

export default App;
