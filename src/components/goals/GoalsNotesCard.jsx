function GoalsNotesCard({ tipsCardClass, tipsTitleClass, tipsTextClass }) {
  return (
    <section className={tipsCardClass}>
      <h2 className={tipsTitleClass}>Important Notes</h2>

      <ul className={tipsTextClass}>
        <li>
         A subject cannot be deleted if study sessions are linked to it.
          Please make sure you <strong>Delete</strong> all sessions related to that subject first.
        </li>

        <li>
          All changes on this page  "including semester settings and subjects"
          are saved together using the <strong>Save All Changes </strong> button.
        </li>
      </ul>
    </section>
  )
}

export default GoalsNotesCard
