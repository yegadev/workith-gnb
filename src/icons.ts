import {
  BarChart3,
  Clock,
  FileText,
  Folder,
  LayoutGrid,
  type LucideIcon,
  Mail,
  MapPinPen,
  Settings,
  Users,
} from 'lucide-react'

/**
 * 아이콘 키 → lucide 컴포넌트 매핑.
 * 아이콘을 컴포넌트가 아닌 문자열 키로 받는 이유: 2단계에서 공통 API 가
 * 앱 목록을 JSON 으로 내려줄 때 직렬화 가능해야 하기 때문.
 */
const ICON_MAP: Readonly<Record<string, LucideIcon | undefined>> = {
  groupware: Settings, // 그룹웨어 공통 (설정/사용자/권한)
  editor: FileText, // CRDT 에디터
  mail: Mail, // 메일
  files: Folder, // 파일
  op: BarChart3, // 예가비즈 OP (경영지표)
  withlog: MapPinPen, // Withlog (위치 기반 기록)
  attendance: Clock, // (예정) 근태관리
  hr: Users, // (예정) HR
}

/** 미지의 키에 사용하는 기본 폴백 아이콘 */
export const DEFAULT_ICON: LucideIcon = LayoutGrid

/** 아이콘 키를 lucide 컴포넌트로 변환한다. 미지의 키는 기본 아이콘으로 폴백 */
export function resolveIcon(key: string): LucideIcon {
  return ICON_MAP[key] ?? DEFAULT_ICON
}
