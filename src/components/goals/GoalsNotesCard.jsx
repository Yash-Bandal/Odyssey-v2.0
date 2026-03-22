function GoalsNotesCard({ tipsCardClass, tipsTitleClass, tipsTextClass }) {
  return (
    <section className={tipsCardClass}>
      <h2 className={tipsTitleClass}>Important Notes</h2>

      <ul className={tipsTextClass}>
        <li>
          A subject cannot be deleted if study sessions are linked to it.
          Please delete all related sessions first.
        </li>

        <li>
          All changes on this page (semester settings and subjects)
          are saved together using the <strong>Save All Changes</strong> button.
        </li>

        <li>
          You can update the semester dates, but the start date cannot be set in the past.
          End date must also not be in the past.
        </li>

        <li>
          You can start a new semester only after the current one has ended,
          but you can update current semester dates upto Present day.
        </li>
        <li>
          Overlapping semesters are not allowed.
        </li>

        <li>
          Past semesters are preserved and cannot be modified once completed.
        </li>
      </ul>
    </section>
  )
}

export default GoalsNotesCard
