import { BookOpen, Trash2, Plus } from 'lucide-react'

function SubjectsCard({
  cardClass,
  subjectHeaderTitleClass,
  subjectHeaderMutedClass,
  handleAddSubject,
  addButtonClass,
  subjects,
  setSubjects,
  subjectRowClass,
  iconColorClass,
  subjectInputClass,
  subjectNumberInputClass,
  handleDeleteSubject,
  deleteButtonClass,
}) {
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={subjectHeaderTitleClass}>Subjects</h2>
          <p className={subjectHeaderMutedClass}>
            Allocate hours and weightage for each subject.
          </p>
        </div>

        <button type="button" onClick={handleAddSubject} className={addButtonClass}>
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={subject.id || `new-${index}`} className={subjectRowClass}>
            <div className="flex items-center gap-3 flex-1">
              <BookOpen className={`h-5 w-5 ${iconColorClass}`} />
              <input
                type="text"
                value={subject.name}
                onChange={(e) => {
                  const updated = [...subjects]
                  updated[index].name = e.target.value
                  setSubjects(updated)
                }}
                className={subjectInputClass}
                placeholder="Subject name"
              />
            </div>

            <input
              type="number"
              value={subject.target_hours}
              onChange={(e) => {
                const updated = [...subjects]
                updated[index].target_hours = e.target.value
                setSubjects(updated)
              }}
              className={subjectNumberInputClass}
              placeholder="Plan Hours"
            />

            <input
              type="number"
              value={subject.weight || ''}
              onChange={(e) => {
                const updated = [...subjects]
                updated[index].weight = e.target.value
                setSubjects(updated)
              }}
              className={subjectNumberInputClass.replace('md:w-32', 'md:w-28')}
              placeholder="Weight %"
            />

            <button
              type="button"
              onClick={() => {
                handleDeleteSubject(subject.id)
              }}
              className={deleteButtonClass}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SubjectsCard
