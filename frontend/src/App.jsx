import Header from './components/Header'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'

function App() {
    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md text-body-md">
            <Header />
            <Dashboard />
            <Footer />
        </div>
    )
}

export default App