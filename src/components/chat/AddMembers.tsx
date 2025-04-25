import ReactDOM from 'react-dom'
import Select, { MultiValue } from 'react-select'
import { IoMdClose } from 'react-icons/io'

interface ContactOption {
  value: number
  label: string
  avatar: string
}

interface Props {
  open: boolean
  onClose: () => void
  options: ContactOption[]
  value: MultiValue<ContactOption>
  onChange: (v: MultiValue<ContactOption>) => void
  onSave: () => void
}

export default function AddMembersModal({
  open,
  onClose,
  options,
  value,
  onChange,
  onSave,
}: Props) {
  if (!open) return null

  return ReactDOM.createPortal(
    <div className="overlayAddMembers">
      <div className="modalAddMembers">
        <div className='btnCloseAddMembers'>
          <button type="button" onClick={onClose}><IoMdClose /></button>
        </div>
        <div className="containerAddMembers">
          <div className="headerModal">
            <h1>Adicionar Membros!</h1>
            <p>Selecione abaixo os membros para adicionar ao grupo!</p>
          </div>

          <div className='selectAddMembers'>
            <Select
              options={options}
              isMulti
              value={value}
              onChange={v => onChange(v as MultiValue<ContactOption>)}
              placeholder="Filtre e selecione contatos..."
              formatOptionLabel={({ label, avatar }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={avatar}
                    alt={label}
                    style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8 }}
                  />
                  <span>{label}</span>
                </div>
              )}
              getOptionValue={opt => String(opt.value)}
              className="my-select"
              classNamePrefix="my-select"
              maxMenuHeight={300}
            />
          </div>

          <button
            className="btnSaveMembers"
            type="button"
            onClick={() => {onSave()}}
            disabled={value.length === 0}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
