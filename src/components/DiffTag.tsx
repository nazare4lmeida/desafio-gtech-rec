import { Difficulty } from '../types'
import { diffLabel, diffClass } from '../utils/helpers'

export default function DiffTag({ d }: { d: Difficulty }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[.68rem] font-bold tracking-wide uppercase ${diffClass(d)}`}>
      {diffLabel(d)}
    </span>
  )
}
