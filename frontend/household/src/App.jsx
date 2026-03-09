import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminRegister from './pages/logins/AdminRegister';
import AdminLogin from './pages/logins/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerSignup from './pages/logins/CustomerSignup';
import CustomerLogin from './pages/logins/CustomerLogin';
import ProfessionalSignup from './pages/logins/ProfessionalSignup';
import ProfessionalLogin from './pages/logins/ProfessionalLogin';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProfessionalDashboard from './pages/professional/ProfessionalDashboard';
import  AdminProDetail from './pages/admin/AdminProDetail';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import ProtectedRoute from './pages/logins/ProtectedRoutes';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-admin" element={<AdminRegister />} />
         <Route path="/admin-login" element={<AdminLogin />} />
         <Route element={<ProtectedRoute/>}>
         <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/pro-details/:id" element={<AdminProDetail/>}/>
         <Route path="/cus-details/:id" element={<AdminCustomerDetail/>}/>
         <Route path="/customer-dashboard" element={<CustomerDashboard/>}/>
         <Route path="/pro-dashboard" element={<ProfessionalDashboard/>}/>
         </Route>
         <Route path="/customer-signup" element={<CustomerSignup/>} />
         <Route path="/customer-login" element={<CustomerLogin/>}/>
         <Route path="/pro-login" element={<ProfessionalLogin/>}/>
         <Route path="/pro-signup" element={<ProfessionalSignup/>}/>
         
         
         
      </Routes>
    </Router>
  );
}
export default App;