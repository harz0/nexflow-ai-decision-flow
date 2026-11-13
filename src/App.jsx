
import WorkflowCanvas from "./components/workflowcanvas";

function App() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <header className="flex h-[68px] items-center justify-between border-b border-slate-800 bg-[#0b1725] px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 text-xl font-bold">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">NexFlow</h1>
            <p className="text-[10px] tracking-widest text-slate-400">
              AI WORKFLOW STUDIO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Backend connected
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
              Workflow workspace
            </p>
            <h2 className="text-2xl font-bold md:text-3xl">
              Build. Connect. Execute.
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Design intelligent decision flows powered by AI.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-[#101d2e] px-4 py-2 text-xs text-slate-300">
            Project: <span className="font-semibold text-white">Untitled workflow</span>
          </div>
        </div>

        <WorkflowCanvas />
      </main>

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        NexFlow · AI-powered workflow automation
      </footer>
    </div>
  );
}

export default App;
