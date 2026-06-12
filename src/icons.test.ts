import { BarChart3, CalendarClock, Mail } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_ICON, resolveIcon } from './icons'

describe('resolveIcon', () => {
  it('알려진 키는 매핑된 lucide 아이콘을 반환한다', () => {
    expect(resolveIcon('mail')).toBe(Mail)
  })

  it('op 키는 BarChart3 아이콘으로 매핑된다', () => {
    expect(resolveIcon('op')).toBe(BarChart3)
  })

  it('withlog 키는 CalendarClock 아이콘으로 매핑된다', () => {
    expect(resolveIcon('withlog')).toBe(CalendarClock)
  })

  it('미지의 키는 기본 아이콘으로 폴백한다', () => {
    expect(resolveIcon('unknown-key')).toBe(DEFAULT_ICON)
  })
})
