import Sidebar from './Sidebar';

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="app-main">{children}</main>
  </div>
);

export default AppLayout;