import Hero from '../components/Hero'
import Metrics from '../components/Metrics'
import RecentAnalyses from '../components/RecentAnalyses'
import KnowledgeCallout from '../components/KnowledgeCallout'

function Dashboard() {
    return (
        <main className="flex-grow max-w-7xl mx-auto w-full px-8 py-8 space-y-10">
            <Hero />
            <Metrics />
            <RecentAnalyses />
            <KnowledgeCallout />
        </main>
    )
}

export default Dashboard