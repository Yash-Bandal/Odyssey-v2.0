function GoalsHeader({ headerTitleClass, headerMutedClass }) {
  return (
    <div>
      <h1 className={headerTitleClass}>Semester Planning</h1>
      <p className={headerMutedClass}>
        Define your semester timeline and distribute study hours strategically.
      </p>
    </div>
  )
}

export default GoalsHeader
