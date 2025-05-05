import React, { Suspense } from 'react'
import { IoClose } from 'react-icons/io5'
import Skeleton from 'react-loading-skeleton'

const DadosConta = React.lazy(() => import('../../DadosConta'))

export interface AccountSectionProps {
  onBack: () => void
}

const AccountSection: React.FC<AccountSectionProps> = ({ onBack }) => (
  <div className="dadosConta">
    <div className="cabecalhoConta">
      <h1>Dados da Conta</h1>
      <IoClose onClick={onBack} />
    </div>
    <Suspense fallback={<Skeleton height={200} />}>
      <DadosConta />
    </Suspense>
  </div>
)

export default AccountSection
