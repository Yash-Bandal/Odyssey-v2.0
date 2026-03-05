import { Plus, Check, Trash2, ListTodo } from 'lucide-react'
import { playDelete } from '../../utils/sound'

function QuickTodoCard({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  dashboardMutedTextClass,
  todoInput,
  setTodoInput,
  handleAddTodo,
  todoItems,
  completedTodoCount,
  handleToggleTodo,
  handleDeleteTodo,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-indigo-500" />
          <h2 className={dashboardTitleClass}>Quick Todo</h2>
        </div>

        <span className={['text-xs font-medium', dashboardMutedTextClass].join(' ')}>
          {completedTodoCount}/{todoItems.length}
        </span>
      </div>

      <form onSubmit={handleAddTodo} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <input
            type="text"
            value={todoInput}
            onChange={(event) => setTodoInput(event.target.value)}
            placeholder="Add a task..."
            className={[
              'w-full rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
              isDark
                ? 'bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500'
                : 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400',
            ].join(' ')}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-3">
        {todoItems.length === 0 ? (
          <div
            className={[
              'rounded-2xl border px-4 py-6 text-sm text-center',
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-500'
                : 'border-slate-200 bg-slate-50 text-slate-500',
            ].join(' ')}
          >
            Nothing planned yet.
          </div>
        ) : (
          todoItems.map((item) => (
            <div
              key={item.id}
              className={[
                'group rounded-2xl border px-4 py-3 flex items-center justify-between transition',
                isDark
                  ? 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                  : 'border-slate-200 bg-white hover:bg-slate-50',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => handleToggleTodo(item.id)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div
                  className={[
                    'h-8 w-8 flex items-center justify-center rounded-full border transition',
                    item.done
                      ? 'bg-green-400 border-white'
                      : isDark
                        ? 'border-slate-600 bg-slate-950'
                        : 'border-slate-300 bg-white',
                  ].join(' ')}
                >
                  {item.done && <Check className="h-3 w-3 text-white" />}
                </div>

                <span
                  className={[
                    'text-sm font-medium transition',
                    item.done
                      ? isDark
                        ? 'text-slate-500 line-through'
                        : 'text-slate-400 line-through'
                      : isDark
                        ? 'text-slate-200'
                        : 'text-slate-800',
                  ].join(' ')}
                >
                  {item.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playDelete()
                  handleDeleteTodo(item.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-6 w-6" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default QuickTodoCard
