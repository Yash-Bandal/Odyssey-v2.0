function GoalsNotesCard({ tipsCardClass, tipsTitleClass, tipsTextClass }) {
  return (
    <section className={tipsCardClass}>
      <h2 className={tipsTitleClass}>Important Notes</h2>

      <ul className={tipsTextClass}>
        <li>
          â€¢ A subject cannot be deleted if study sessions are linked to it.
          Please delete all sessions related to that subject first.
        </li>

        <li>
          â€¢ All changes on this page â€” including semester settings and subjects â€”
          are saved together using the <strong>â€œSave All Changesâ€</strong> button.
        </li>
      </ul>
    </section>
  )
}

export default GoalsNotesCard
