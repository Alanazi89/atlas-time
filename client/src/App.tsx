/** ATLAS TIME — مسارات المنتج: تجربة وقت عالمي مترابطة بلا صفحات فارغة. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { TimeProvider } from "./contexts/TimeContext";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Cities from "./pages/Cities";
import Compare from "./pages/Compare";
import Meeting from "./pages/Meeting";
import Travel from "./pages/Travel";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import { Route, Switch } from "wouter";

function Router() { return <Switch><Route path="/" component={Home}/><Route path="/cities" component={Cities}/><Route path="/compare" component={Compare}/><Route path="/meeting" component={Meeting}/><Route path="/travel" component={Travel}/><Route path="/favorites" component={Favorites}/><Route path="/settings" component={Settings}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch>; }

export default function App() { return <ErrorBoundary><TimeProvider><TooltipProvider><Toaster/><Router/></TooltipProvider></TimeProvider></ErrorBoundary>; }
