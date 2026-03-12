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
import BookingPage from './pages/customer/BookingPage';
import  AdminProDetail from './pages/admin/AdminProDetail';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail';
import ProtectedRoute from './pages/logins/ProtectedRoutes';
import ViewProfessional from './pages/customer/ViewProfessional';
import EmailVerification from './pages/logins/EmailVerification';
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
         <Route path="/pro-profile/:proId" element={<ViewProfessional />} />
         <Route path="/pro-dashboard" element={<ProfessionalDashboard/>}/>
         <Route path="/book/:proId" element={<BookingPage />} />
         </Route>
         <Route path="/customer-signup" element={<CustomerSignup/>} />
         <Route path="/customer-login" element={<CustomerLogin/>}/>
         <Route path="/pro-login" element={<ProfessionalLogin/>}/>
         <Route path="/pro-signup" element={<ProfessionalSignup/>}/>
         <Route path="/verify-email" element={<EmailVerification />} />
         
         
         
      </Routes>
    </Router>
  );
}
export default App;