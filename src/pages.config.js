/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import CreateLoan from './pages/CreateLoan';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';
import Guide from './pages/Guide';
import Home from './pages/Home';
import Language from './pages/Language';
import Legal from './pages/Legal';
import LoanDetails from './pages/LoanDetails';
import LoanManagement from './pages/LoanManagement';
import More from './pages/More';
import Notifications from './pages/Notifications';
import NotificationsList from './pages/NotificationsList';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Verification from './pages/Verification';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "CreateLoan": CreateLoan,
    "FAQ": FAQ,
    "Feedback": Feedback,
    "Guide": Guide,
    "Home": Home,
    "Language": Language,
    "Legal": Legal,
    "LoanDetails": LoanDetails,
    "LoanManagement": LoanManagement,
    "More": More,
    "Notifications": Notifications,
    "NotificationsList": NotificationsList,
    "Privacy": Privacy,
    "Profile": Profile,
    "Security": Security,
    "Services": Services,
    "Settings": Settings,
    "Support": Support,
    "Terms": Terms,
    "Verification": Verification,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};