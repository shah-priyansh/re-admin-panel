import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductsList from './pages/ProductsList';
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import EditUser from './pages/EditUser';
import AddProduct from './pages/AddProduct';
import BulkUploadProducts from './pages/BulkUploadProducts';
import OrdersList from './pages/OrdersList';
import OrderDetail from './pages/OrderDetail';
import ReturnRequestsList from './pages/ReturnRequestsList';
import ReturnRequestDetail from './pages/ReturnRequestDetail';
import ContactEnquiriesList from './pages/ContactEnquiriesList';
import ContactEnquiryDetail from './pages/ContactEnquiryDetail';
import TrustapTransactionsList from './pages/TrustapTransactionsList';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UsersList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <EditUser />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId/add-product"
          element={
            <ProtectedRoute>
              <Layout>
                <AddProduct />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId/bulk-upload"
          element={
            <ProtectedRoute>
              <Layout>
                <BulkUploadProducts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/bulk-upload"
          element={
            <ProtectedRoute>
              <Layout>
                <BulkUploadProducts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductsList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <EditProduct />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="card">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
                  <p className="text-gray-600">Analytics page - Coming soon</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <OrdersList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <OrderDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/return-requests"
          element={
            <ProtectedRoute>
              <Layout>
                <ReturnRequestsList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/return-requests/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ReturnRequestDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-enquiries"
          element={
            <ProtectedRoute>
              <Layout>
                <ContactEnquiriesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact-enquiries/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ContactEnquiryDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trustap-transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <TrustapTransactionsList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="card">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                  <p className="text-gray-600">Settings page - Coming soon</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
