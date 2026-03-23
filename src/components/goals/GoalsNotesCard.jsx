function GoalsNotesCard({ tipsCardClass, tipsTitleClass, tipsTextClass }) {
  return (
    <section className={tipsCardClass}>
      <h2 className={tipsTitleClass}>Important Notes</h2>
      {/* <h2 className="font-normal m-2 text-slate-50">Quote : You can See the Past, Not change it, But you can choose the Right Future</h2> */}

      <ul className={tipsTextClass}>
        <li>
          A subject cannot be deleted if study sessions are linked to it.
          Please delete all related sessions first.
        </li>

        <li>
          All changes to semester settings and subjects are saved using the <strong>Save Changes</strong> button.
        </li>

        <li>
          You can update the current semester. The start date cannot be moved earlier than its original start,
          but the end date can be extended as needed.
        </li>

        <li>
          End date cannot be set in the past, and must always be after the start date.
        </li>

        <li>
          You can start a new semester only after the current one has ended, overlapping semesters are not allowed.
        </li>

     


        <li>
          Past semesters are locked and cannot be modified once completed.
        </li>
      </ul>
    </section>
  )
}

export default GoalsNotesCard
