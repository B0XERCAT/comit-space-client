import { Table } from '@tanstack/react-table'
import React from 'react'

import { DataTableViewOptions } from '@/components/common/DataTable/ViewOptions'

interface ControlHeaderProps {
  table: Table<any>
  getRowSelection: () => Record<string, boolean>
}

const ControlHeader = ({ table, getRowSelection }: ControlHeaderProps) => {
  return (
    <div className="flex w-full items-center">
      <DataTableViewOptions table={table} />
    </div>
  )
}

export default ControlHeader
