import React, { Suspense } from 'react'
import { IoClose } from 'react-icons/io5'
import { BsPlusCircleDotted } from "react-icons/bs";
import Skeleton from 'react-loading-skeleton'

const StatusList = React.lazy(() => import('../../status/components/StatusList'))
const StatusUser = React.lazy(() => import('../../status/components/StatusUser'))
const StatusUploader = React.lazy(() => import('../../status/components/StatusUploader'))

export interface StatusSectionProps {
  onBack: () => void
  onFileSelect: (file: File) => void
}

type StatusSectionComponent = React.FC<StatusSectionProps> & {
  Uploader: typeof StatusUploader
}

const StatusSection: StatusSectionComponent = ({
  onBack,
  onFileSelect,
}) => (
  <div className="abaStatus">
    <div className="cabecalhoStatus">
      <h1>Status</h1>
      <IoClose onClick={onBack} />
    </div>

    <div className="seusStatus">
      <Suspense fallback={<Skeleton height={100} />}>
        <StatusUser />
      </Suspense>
      <h1>Meu status</h1>
      <div className="btnADDStatus" onClick={() => document.getElementById('status-input')?.click()}>
        <BsPlusCircleDotted />
      </div>
    </div>
    <div className="barraStatus"></div>

    <Suspense fallback={<Skeleton />}>
      <div className="contatoStatus">
        <StatusList />
      </div>
    </Suspense>

    <input
      id="status-input"
      type="file"
      style={{ display: 'none' }}
      accept="image/*,video/*"
      onChange={e => {
        const f = e.target.files?.[0]
        if (f && f.size <= 10 * 1024 * 1024) onFileSelect(f)
        else alert('O arquivo excede o limite de 10MB. Por favor, selecione outro arquivo.')
      }}
    />
  </div>
)

StatusSection.Uploader = StatusUploader

export default StatusSection
