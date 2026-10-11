import { useState } from 'react'
import { useGoBack } from '../../lib/navHistory'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import {
  VendorsPageHeader,
  VendorsDirectory,
  DrawerOverlay,
  DrawerHeader,
  DrawerSubmitButton,
  UploadedFileRow,
  ImportRowCollapsed,
  ImportRowNeedsAttention,
  type VendorType,
} from './shared'

type ImportRow = { key: string; name: string; type: VendorType; needsFirstName?: boolean }

const PARSED_ROWS: ImportRow[] = [
  { key: 'joleen', name: 'Joleen Freeman', type: 'Individual', needsFirstName: true },
  { key: 'northwind', name: 'Northwind Design Ltd', type: 'Business' },
  { key: 'meridian', name: 'Meridian Legal Partners', type: 'Business' },
  { key: 'acme', name: 'Acme Print Co', type: 'Business' },
  { key: 'alice', name: 'Alice Mitchell', type: 'Individual', needsFirstName: true },
  { key: 'figma', name: 'Figma', type: 'Business' },
]

// Figma node 45523:714530 — "Import vendors" CSV bulk-upload drawer
export default function ImportVendors() {
  const navigate = useNavigate()
  const goBack = useGoBack('/vendors')
  const [rows, setRows] = useState(PARSED_ROWS)
  const [firstNames, setFirstNames] = useState<Record<string, string>>({ joleen: '', alice: '' })
  const remove = (key: string) => setRows((r) => r.filter((x) => x.key !== key))
  // Progressive validation: every remaining row that needs a first name must have one.
  const isValid = rows.length > 0 && rows.every((r) => !r.needsFirstName || (firstNames[r.key] ?? '').trim() !== '')

  return (
    <AppShell>
      <main className="relative mx-auto flex w-full flex-col gap-6 py-8">
        <VendorsPageHeader
          subtitle="Manage the people and businesses you pay, their payout details and spending history."
          onAddVendor={() => navigate('/vendors/add-country-dropdown')}
          onImport={() => {}}
        />

        <VendorsDirectory searchDemoTo={(q) => navigate('/vendors/empty-search', { state: { query: q } })} />

        <DrawerOverlay>
          <div className="flex flex-col gap-7">
            <DrawerHeader title="Import vendors" subtitle="Upload a CSV or Excel file to create several vendors at once." onBack={goBack} />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-text-primary">Upload CSV</p>
              <UploadedFileRow onRemove={() => setRows([])} />
            </div>

            <div className="flex flex-col gap-4">
              {rows.map((r) =>
                r.needsFirstName ? (
                  <ImportRowNeedsAttention
                    key={r.key}
                    name={r.name}
                    firstName={firstNames[r.key] ?? ''}
                    onFirstNameChange={(v) => setFirstNames((f) => ({ ...f, [r.key]: v }))}
                    onDelete={() => remove(r.key)}
                  />
                ) : (
                  <ImportRowCollapsed key={r.key} name={r.name} type={r.type} onDelete={() => remove(r.key)} />
                ),
              )}
              {rows.length === 0 && <p className="rounded-xl border border-dashed border-[#cbd0d8] p-4 text-center text-sm text-[#6b7280]">No vendors left to import. Upload another file to continue.</p>}
            </div>

            <DrawerSubmitButton label="Submit for approval" enabled={isValid} onClick={() => navigate('/vendors')} />
          </div>
        </DrawerOverlay>
      </main>
    </AppShell>
  )
}
