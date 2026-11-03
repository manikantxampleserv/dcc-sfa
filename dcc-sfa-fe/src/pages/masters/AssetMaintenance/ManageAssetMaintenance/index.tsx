import { Add } from '@mui/icons-material';
import {
  Chip,
  CircularProgress,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useFormik } from 'formik';
import {
  useAssetMaintenanceById,
  useAssignMaintenanceTechnician,
  useCloseMaintenanceJob,
  useCreateAssetMaintenance,
  useUpdateAssetMaintenance,
  type AssetMaintenance,
} from 'hooks/useAssetMaintenance';
import { useCurrency } from 'hooks/useCurrency';
import { CheckCircle, Clock, Flag } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { assetMaintenanceValidationSchema } from 'schemas/assetMaintenance.schema';
import { DeleteButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import AssetSelect from 'shared/AssetSelect';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import {
  formatDate,
  formatDateTime,
  formatForDateInput,
} from 'utils/dateUtils';

interface ManageAssetMaintenanceProps {
  selectedMaintenance?: AssetMaintenance | null;
  setSelectedMaintenance: (maintenance: AssetMaintenance | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

interface SpareRow {
  tempId: string;
  name: string;
  quantity: number;
  unit_cost: number;
}

/**
 * ManageAssetMaintenance Component.
 * Implements the 4-stage workflow drawer (Open -> Assigned -> Repaired -> Closed)
 * using DCC-SFA shared components and clean layout architecture.
 *
 * @param {ManageAssetMaintenanceProps} props Component props.
 * @returns {React.ReactElement} Drawer element.
 */
const ManageAssetMaintenance: React.FC<ManageAssetMaintenanceProps> = ({
  selectedMaintenance,
  setSelectedMaintenance,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedMaintenance;
  const maintenanceId = selectedMaintenance?.id || 0;
  const { formatCurrency } = useCurrency();

  /** Fetch fresh ticket details and lifecycle logs when editing an existing job */
  const {
    data: freshData,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useAssetMaintenanceById(maintenanceId, {
    enabled: isEdit && drawerOpen,
  });

  const activeTicket: AssetMaintenance | null =
    freshData || selectedMaintenance || null;

  const createAssetMaintenanceMutation = useCreateAssetMaintenance();
  const updateAssetMaintenanceMutation = useUpdateAssetMaintenance();
  const assignTechnicianMutation = useAssignMaintenanceTechnician();
  const closeJobMutation = useCloseMaintenanceJob();

  /** Assignment sub-form state */
  const [assignedTechId, setAssignedTechId] = useState<number | string>('');
  const [ticketPriority, setTicketPriority] = useState<string>('medium');
  const [ticketDueDate, setTicketDueDate] = useState<string>('');

  /** Quick add spare part state */
  const [newPartName, setNewPartName] = useState<string>('');
  const [newPartQty, setNewPartQty] = useState<number>(1);
  const [newPartUnitCost, setNewPartUnitCost] = useState<number | string>('');

  /** Spares list state for ticket editing */
  const [sparesList, setSparesList] = useState<SpareRow[]>([]);

  /** Populate state when active ticket changes */
  useEffect(() => {
    if (activeTicket) {
      setAssignedTechId(activeTicket.technician_id || '');
      setTicketPriority(activeTicket.priority || 'medium');
      setTicketDueDate(
        activeTicket.due_date ? formatForDateInput(activeTicket.due_date) : ''
      );

      const mappedSpares: SpareRow[] = (activeTicket.spares || []).map(
        (s: any, idx: number) => ({
          tempId: s.id ? `sp_${s.id}` : `sp_row_${idx}`,
          name: s.part_name || s.name || '',
          quantity: s.quantity || 1,
          unit_cost:
            s.unit_cost !== undefined
              ? Number(s.unit_cost)
              : s.cost
                ? Number(s.cost)
                : 0,
        })
      );
      setSparesList(mappedSpares);
    } else {
      setAssignedTechId('');
      setTicketPriority('medium');
      setTicketDueDate('');
      setSparesList([]);
    }
  }, [activeTicket]);

  /** Formik form setup for creating brand new maintenance jobs */
  const initialValues = useMemo(
    () => ({
      asset_id: selectedMaintenance?.asset_id?.toString() || '',
      maintenance_date: formatForDateInput(
        selectedMaintenance?.maintenance_date
      ),
      issue_reported: selectedMaintenance?.issue_reported || '',
      action_taken: selectedMaintenance?.action_taken || '',
      technician_id: selectedMaintenance?.technician_id?.toString() || '',
      priority: selectedMaintenance?.priority || 'medium',
      repair_location: selectedMaintenance?.repair_location || 'onsite',
      cost: selectedMaintenance?.cost?.toString() || '',
      remarks: selectedMaintenance?.remarks || '',
      is_active: selectedMaintenance?.is_active || 'Y',
      spares: [] as SpareRow[],
    }),
    [selectedMaintenance]
  );

  const formik = useFormik({
    initialValues,
    validationSchema: assetMaintenanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const formattedSpares = sparesList
          .filter(s => s.name?.trim())
          .map(s => ({
            name: s.name.trim(),
            quantity: Math.max(1, Number(s.quantity) || 1),
            unit_cost: Math.max(0, Number(s.unit_cost) || 0),
            cost: Math.max(
              0,
              (Number(s.quantity) || 1) * (Number(s.unit_cost) || 0)
            ),
          }));

        const submitData = {
          asset_id: Number(values.asset_id),
          maintenance_date: values.maintenance_date,
          issue_reported: values.issue_reported,
          action_taken: values.action_taken,
          technician_id: values.technician_id
            ? Number(values.technician_id)
            : undefined,
          priority: values.priority,
          repair_location: values.repair_location,
          cost: values.cost ? Math.max(0, Number(values.cost)) : undefined,
          remarks: values.remarks,
          is_active: values.is_active,
          spares: formattedSpares,
        };

        if (isEdit && selectedMaintenance) {
          await updateAssetMaintenanceMutation.mutateAsync({
            id: selectedMaintenance.id,
            data: submitData,
          });
        } else {
          await createAssetMaintenanceMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.error('Error submitting asset maintenance:', error);
      }
    },
  });

  const handleCancel = () => {
    setSelectedMaintenance(null);
    setDrawerOpen(false);
    formik.resetForm();
    setNewPartName('');
    setNewPartQty(1);
    setNewPartUnitCost('');
    setSparesList([]);
  };

  /** Auto-calculate SLA due date when priority changes */
  const handlePriorityChange = (newPrio: string) => {
    setTicketPriority(newPrio);
    const d = new Date();
    if (newPrio === 'high') {
      d.setDate(d.getDate() + 2);
    } else if (newPrio === 'medium') {
      d.setDate(d.getDate() + 5);
    } else {
      d.setDate(d.getDate() + 10);
    }
    setTicketDueDate(formatForDateInput(d.toISOString()));
  };

  /** Handle updating assignment (technician, priority, SLA due date) */
  const handleUpdateAssignment = async () => {
    if (!activeTicket?.id || !assignedTechId) return;
    try {
      await assignTechnicianMutation.mutateAsync({
        id: activeTicket.id,
        data: {
          technician_id: Number(assignedTechId),
          priority: ticketPriority,
          due_date: ticketDueDate
            ? new Date(ticketDueDate).toISOString()
            : undefined,
        },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  /** Quick add spare part */
  const handleAddSparePart = () => {
    if (!newPartName.trim()) return;
    const unitCost = Math.max(0, Number(newPartUnitCost) || 0);
    const qty = Math.max(1, Number(newPartQty) || 1);
    const newRow: SpareRow = {
      tempId: `sp_${Date.now()}`,
      name: newPartName.trim(),
      quantity: qty,
      unit_cost: unitCost,
    };
    setSparesList(prev => [...prev, newRow]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartUnitCost('');
  };

  /** Remove spare part */
  const handleRemoveSpare = (index: number) => {
    setSparesList(prev => prev.filter((_, i) => i !== index));
  };

  /** Total spares cost calculation */
  const sparesTotalCost = useMemo(() => {
    return sparesList.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 1) * (Number(item.unit_cost) || 0),
      0
    );
  }, [sparesList]);

  /** Total ticket cost from spares */
  const totalTicketCost = useMemo(() => sparesTotalCost, [sparesTotalCost]);

  /** Handle closing the job */
  const handleCloseJob = async () => {
    if (!activeTicket?.id) return;
    try {
      await closeJobMutation.mutateAsync({
        id: activeTicket.id,
        data: {
          labour_cost: 0,
          spares: sparesList.map(s => ({
            name: s.name,
            quantity: s.quantity,
            unit_cost: s.unit_cost,
          })),
          remarks: activeTicket.remarks || undefined,
        },
      });
      await refetchDetails();
    } catch (error) {
      console.error('Failed to close job:', error);
    }
  };

  /** Current stage index for stepper (0: open, 1: assigned, 2: repaired, 3: closed) */
  const currentStatus = (activeTicket?.status || 'open').toLowerCase();
  const stages = ['open', 'assigned', 'repaired', 'closed'];
  const stageIndex =
    stages.indexOf(currentStatus) >= 0 ? stages.indexOf(currentStatus) : 0;

  /** Format outlet location display */
  const outletInfo = useMemo(() => {
    const master = activeTicket?.asset_maintenance_master;
    const customer =
      activeTicket?.customer ||
      master?.asset_master_outlet ||
      master?.cooler_asset_master?.[0]?.coolers_customers ||
      master?.customer_assets?.[0]?.customer_customer_assets;
    if (customer?.name) {
      return `${customer.name}${customer.code ? ` (${customer.code})` : ''}`;
    }
    if (master?.current_location) {
      return master.current_location;
    }
    return master?.asset_master_depot?.name
      ? `${master.asset_master_depot.name} Depot`
      : 'Unassigned Location';
  }, [activeTicket]);

  const coolerTitle = useMemo(() => {
    const master = activeTicket?.asset_maintenance_master;
    const serial = master?.serial_number || '20968';
    const subType = master?.asset_master_asset_types?.name || 'CPE0400';
    return `SANDEN - ${serial} - ${subType}`;
  }, [activeTicket]);

  /** Table columns configuration for spares */
  const spareColumns: TableColumn<SpareRow>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Part Name',
        render: (_value, row) => (
          <span className="font-medium text-gray-800">{row.name}</span>
        ),
      },
      {
        id: 'quantity',
        label: 'Qty',
        width: 80,
        render: (_value, row) => (
          <span className="text-gray-600">{row.quantity}</span>
        ),
      },
      {
        id: 'unit_cost',
        label: 'Unit Cost',
        width: 140,
        render: (_value, row) => (
          <span className="text-gray-600">{formatCurrency(row.unit_cost)}</span>
        ),
      },
      {
        id: 'total',
        label: 'Total',
        width: 140,
        numeric: true,
        render: (_value, row) => (
          <span className="font-semibold text-gray-900">
            {formatCurrency((row.quantity || 1) * (row.unit_cost || 0))}
          </span>
        ),
      },
      ...(currentStatus !== 'closed'
        ? [
            {
              id: 'actions',
              label: '',
              width: 60,
              sortable: false,
              render: (_value: any, _row: any, rowIndex: number) => (
                <div className="flex items-center justify-end">
                  <DeleteButton
                    onClick={() => handleRemoveSpare(rowIndex)}
                    tooltip="Remove"
                  />
                </div>
              ),
            },
          ]
        : []),
    ],
    [currentStatus, formatCurrency]
  );

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit
          ? activeTicket?.job_number || `Job #${activeTicket?.id || ''}`
          : 'Create Asset Maintenance'
      }
      size="large"
    >
      <div className="p-5 space-y-5">
        {isEdit && activeTicket ? (
          isDetailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <CircularProgress size={36} />
            </div>
          ) : (
            <div className="space-y-4">
              {/** Status badges bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  label={`• ${activeTicket.status ? activeTicket.status.toUpperCase() : 'OPEN'}`}
                  size="small"
                  className={
                    currentStatus === 'closed'
                      ? '!bg-emerald-100 !text-emerald-800 !font-semibold'
                      : currentStatus === 'repaired'
                        ? '!bg-indigo-100 !text-indigo-800 !font-semibold'
                        : currentStatus === 'assigned'
                          ? '!bg-blue-100 !text-blue-800 !font-semibold'
                          : '!bg-amber-100 !text-amber-800 !font-semibold'
                  }
                />
                {activeTicket.is_overdue && currentStatus !== 'closed' && (
                  <Chip
                    label="• Overdue"
                    size="small"
                    className="!bg-rose-100 !text-rose-700 !font-semibold"
                  />
                )}
                {activeTicket.warranty_claim === 'Y' && (
                  <Chip
                    label="• Under warranty"
                    size="small"
                    className="!bg-sky-100 !text-sky-800 !font-semibold"
                  />
                )}
              </div>

              {/** 4-Stage MUI Stepper with Chips instead of numbers */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <Stepper activeStep={stageIndex}>
                  {stages.map((stg, idx) => {
                    const isPassed = idx < stageIndex;
                    const isCurrent = idx === stageIndex;
                    return (
                      <Step key={stg} completed={isPassed}>
                        <StepLabel
                          StepIconComponent={() => null}
                          className="[&_.MuiStepLabel-iconContainer]:!hidden"
                        >
                          <Chip
                            label={stg}
                            size="small"
                            color={
                              isCurrent
                                ? 'primary'
                                : isPassed
                                  ? 'success'
                                  : 'default'
                            }
                            variant={isCurrent ? 'filled' : 'outlined'}
                            className="!capitalize !font-semibold cursor-default"
                          />
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </div>

              {/** Alert Banners: Overdue and Replace-or-Repair Review */}
              {activeTicket.is_overdue && currentStatus !== 'closed' && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Overdue since{' '}
                      {activeTicket.due_date
                        ? formatDate(activeTicket.due_date)
                        : 'due date'}
                    </p>
                    <p className="text-xs text-amber-800">
                      Escalated to the Area Maintenance Manager. Reassign or set
                      a new due date.
                    </p>
                  </div>
                </div>
              )}

              {activeTicket.replace_review_needed && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
                  <Flag size={18} className="text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-rose-900">
                      Replace-or-repair review
                    </p>
                    <p className="text-xs text-rose-800">
                      {activeTicket.repairs_last_90_days || 2} repair jobs in 90
                      days. Consider replacing instead of repairing again.
                    </p>
                  </div>
                </div>
              )}

              {/** Cooler & Location Details Grid */}
              <div className="bg-slate-50 p-4 rounded-lg border border-gray-200 shadow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Cooler
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {coolerTitle}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Current Location
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {outletInfo}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Issue Reported
                  </span>
                  <p className="text-gray-700 mt-0.5">
                    {activeTicket.issue_reported ||
                      'No issue description recorded'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Repair At
                  </span>
                  <p className="text-gray-700 mt-0.5 capitalize">
                    {activeTicket.repair_location || 'On site'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Source
                  </span>
                  <p className="text-gray-700 mt-0.5">
                    {activeTicket.source_type
                      ? `${activeTicket.source_type.toUpperCase()} ${activeTicket.source_code || ''} · ${activeTicket.asset_maintenance_technician?.name || 'Technician'}`
                      : `Inspection · ${activeTicket.asset_maintenance_technician?.name || 'Technician'}`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Raised
                  </span>
                  <p className="text-gray-700 mt-0.5">
                    {activeTicket.maintenance_date
                      ? formatDateTime(activeTicket.maintenance_date)
                      : 'Recently'}
                  </p>
                </div>
                {activeTicket.secondary_source_code && (
                  <div className="col-span-1 md:col-span-2">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                      Also Reported By
                    </span>
                    <p className="text-gray-700 mt-0.5">
                      {activeTicket.secondary_source_code}
                    </p>
                  </div>
                )}
              </div>

              {/** Assignment Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <UserSelect
                    name="assigned_technician"
                    label="Technician"
                    value={assignedTechId ? Number(assignedTechId) : undefined}
                    onChange={(_event: any, user: any) =>
                      setAssignedTechId(user?.id || '')
                    }
                    nameToSearch={
                      activeTicket.asset_maintenance_technician?.name
                    }
                    required
                  />

                  <Select
                    label="Priority"
                    value={ticketPriority}
                    onChange={(e: any) => handlePriorityChange(e.target.value)}
                  >
                    <MenuItem value="low">Low (10 days)</MenuItem>
                    <MenuItem value="medium">Medium (5 days)</MenuItem>
                    <MenuItem value="high">High (2 days)</MenuItem>
                  </Select>

                  <Input
                    label="Due Date"
                    type="date"
                    value={ticketDueDate}
                    onChange={e => setTicketDueDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </div>

                <p className="text-gray-400 block text-[11px]">
                  Due date fills from priority: High 2 days, Medium 5, Low 10.
                  Past due jobs are escalated automatically.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleUpdateAssignment}
                    disabled={
                      assignTechnicianMutation.isPending || !assignedTechId
                    }
                  >
                    {assignTechnicianMutation.isPending
                      ? 'Updating...'
                      : 'Update assignment'}
                  </Button>
                  {activeTicket.asset_maintenance_technician?.name && (
                    <span className="text-xs text-gray-500">
                      Assigned to{' '}
                      {activeTicket.asset_maintenance_technician.name}
                    </span>
                  )}
                </div>
              </div>

              {/** Repair Result (from Mobile) */}
              {(currentStatus === 'repaired' ||
                currentStatus === 'closed' ||
                activeTicket.action_taken) && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow space-y-3">
                  <h4 className="text-sm font-bold text-gray-900">
                    Repair result (from mobile)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                        Action Taken
                      </span>
                      <p className="font-semibold text-gray-800 mt-0.5">
                        {activeTicket.action_taken || 'Replaced parts'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                        Status After Repair
                      </span>
                      <p className="font-semibold text-emerald-700 mt-0.5 capitalize">
                        {activeTicket.status_after_repair || 'Working'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                        Done By
                      </span>
                      <p className="text-gray-700 mt-0.5">
                        {activeTicket.asset_maintenance_technician?.name ||
                          'Technician'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                        Photos
                      </span>
                      <p className="text-gray-700 mt-0.5">
                        {Array.isArray(activeTicket.repair_photos)
                          ? activeTicket.repair_photos.length
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/** Spares and Cost Card */}
              <div className="rounded-lg border border-gray-200 shadow space-y-3">
                <Table
                  data={sparesList}
                  compact
                  actions={
                    <div className="flex justify-between items-center w-full">
                      <h4 className="text-sm font-bold text-gray-900">
                        Spares and cost
                      </h4>
                      {sparesList.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {sparesList.length}{' '}
                          {sparesList.length === 1 ? 'part' : 'parts'}
                        </span>
                      )}
                    </div>
                  }
                  filterColunm={false}
                  sortable={false}
                  columns={spareColumns}
                  getRowId={(item, idx) => item.tempId || `sp_${idx}`}
                  pagination={false}
                  emptyMessage="No spare parts added"
                  footer={
                    <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-slate-50">
                      <span className="text-xs font-semibold text-gray-800">
                        Total:
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {formatCurrency(totalTicketCost)}
                      </span>
                    </div>
                  }
                />

                {/** Quick Add Part Form (editable while not closed) */}
                {currentStatus !== 'closed' && (
                  <div className="space-y-3 px-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Part (typed for now) e.g. Fan motor 12V"
                          size="small"
                          value={newPartName}
                          onChange={e => setNewPartName(e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Qty"
                        type="number"
                        size="small"
                        value={newPartQty}
                        onChange={e =>
                          setNewPartQty(Math.max(1, Number(e.target.value)))
                        }
                      />
                      <Input
                        placeholder="Unit cost (TZS)"
                        type="number"
                        size="small"
                        value={newPartUnitCost}
                        onChange={e =>
                          setNewPartUnitCost(e.target.value.replace(/-/g, ''))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={handleAddSparePart}
                      startIcon={<Add fontSize="small" />}
                    >
                      Add part
                    </Button>
                  </div>
                )}

                {/** Close Job Action or Banner */}
                {currentStatus === 'closed' ? (
                  <div className="p-3 m-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-medium">
                    <CheckCircle
                      size={16}
                      className="text-emerald-600 shrink-0"
                    />
                    <span>
                      Closed. {formatCurrency(totalTicketCost)} saved to Asset
                      Maintenance cost.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex justify-end flex-col items-end px-3 gap-1 pb-2">
                    <Button
                      type="button"
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={handleCloseJob}
                      disabled={
                        closeJobMutation.isPending ||
                        currentStatus !== 'repaired'
                      }
                      startIcon={<CheckCircle size={16} />}
                      className="!w-full md:!w-auto !bg-emerald-600 hover:!bg-emerald-700"
                    >
                      {closeJobMutation.isPending
                        ? 'Closing...'
                        : 'Close Ticket'}
                    </Button>
                    {currentStatus !== 'repaired' && (
                      <p className="text-gray-400 block text-[11px]">
                        You can close once the technician marks the job done on
                        mobile.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/** Status History Audit Trail */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow space-y-2">
                <h4 className="text-sm font-bold text-gray-900">
                  Status history
                </h4>
                <div className="space-y-2 text-xs">
                  {(activeTicket.activities || []).length > 0 ? (
                    activeTicket.activities?.map(act => (
                      <div
                        key={act.id}
                        className="flex items-start justify-between py-1 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <span className="font-semibold text-gray-900 capitalize">
                            {act.title || act.status}
                          </span>
                          <span className="text-gray-500">
                            {' '}
                            · {act.asset_activities_user?.name || 'System'}
                          </span>
                          {act.description && (
                            <p className="text-gray-500 text-[11px] mt-0.5">
                              {act.description}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-400 text-[11px] shrink-0 ml-2">
                          {formatDate(act.created_at)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-1.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>
                          {formatDate(activeTicket.maintenance_date)} · Open ·
                          System
                        </span>
                      </div>
                      {activeTicket.technician_id && (
                        <div className="flex justify-between">
                          <span>
                            Assigned ·{' '}
                            {activeTicket.asset_maintenance_technician?.name ||
                              'Technician'}
                          </span>
                        </div>
                      )}
                      {currentStatus === 'repaired' && (
                        <div className="flex justify-between">
                          <span>
                            Repaired ·{' '}
                            {activeTicket.asset_maintenance_technician?.name ||
                              'Technician'}
                          </span>
                        </div>
                      )}
                      {currentStatus === 'closed' && (
                        <div className="flex justify-between">
                          <span>Closed · Supervisor</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          /** Brand New Maintenance Creation Form */
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetSelect
                name="asset_id"
                label="Asset / Cooler"
                formik={formik}
                required
              />

              <UserSelect
                name="technician_id"
                label="Technician"
                formik={formik}
              />

              <Input
                name="maintenance_date"
                label="Maintenance Date"
                type="date"
                formik={formik}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Select
                name="priority"
                label="Priority"
                value={formik.values.priority}
                onChange={(e: any) =>
                  formik.setFieldValue('priority', e.target.value)
                }
              >
                <MenuItem value="low">Low (10 days)</MenuItem>
                <MenuItem value="medium">Medium (5 days)</MenuItem>
                <MenuItem value="high">High (2 days)</MenuItem>
              </Select>

              <Select
                name="repair_location"
                label="Repair Location"
                value={formik.values.repair_location}
                onChange={(e: any) =>
                  formik.setFieldValue('repair_location', e.target.value)
                }
              >
                <MenuItem value="onsite">On Site</MenuItem>
                <MenuItem value="workshop">Workshop</MenuItem>
              </Select>

              <Input
                name="cost"
                label="Estimated Cost (TZS)"
                type="number"
                placeholder="Enter estimated cost"
                formik={formik}
                onChange={e => {
                  const sanitized = e.target.value.replace(/-/g, '');
                  formik.setFieldValue('cost', sanitized);
                }}
              />
            </div>

            <Input
              name="issue_reported"
              label="Issue Reported"
              placeholder="Describe the issue that was reported"
              formik={formik}
              multiline
              rows={3}
              required
            />
            <div className="h-1"></div>
            <Input
              name="remarks"
              label="Remarks"
              placeholder="Enter additional remarks"
              formik={formik}
              multiline
              rows={2}
            />
            <div className="h-1"></div>

            {/** Spares Section in Create Form */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-gray-900">
                  Spare Parts (Optional)
                </h4>
                {sparesList.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Total: {formatCurrency(totalTicketCost)}
                  </span>
                )}
              </div>

              <Table
                data={sparesList}
                compact
                filterColunm={false}
                sortable={false}
                columns={spareColumns}
                getRowId={(item, idx) => item.tempId || `sp_${idx}`}
                pagination={false}
                emptyMessage="No spare parts added"
                footer={
                  sparesList.length > 0 ? (
                    <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-200 bg-slate-50">
                      <span className="text-xs font-semibold text-gray-800">
                        Total Spares Cost:
                      </span>
                      <span className="text-sm font-bold text-primary-600">
                        {formatCurrency(totalTicketCost)}
                      </span>
                    </div>
                  ) : undefined
                }
              />

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Part name e.g. Fan motor 12V"
                      size="small"
                      value={newPartName}
                      onChange={e => setNewPartName(e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Qty"
                    type="number"
                    size="small"
                    value={newPartQty}
                    onChange={e =>
                      setNewPartQty(Math.max(1, Number(e.target.value)))
                    }
                  />
                  <Input
                    placeholder="Unit cost (TZS)"
                    type="number"
                    size="small"
                    value={newPartUnitCost}
                    onChange={e =>
                      setNewPartUnitCost(e.target.value.replace(/-/g, ''))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={handleAddSparePart}
                  startIcon={<Add fontSize="small" />}
                >
                  Add part
                </Button>
              </div>
            </div>

            <ActiveInactiveField name="is_active" formik={formik} required />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={createAssetMaintenanceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createAssetMaintenanceMutation.isPending}
              >
                {createAssetMaintenanceMutation.isPending
                  ? 'Creating...'
                  : 'Create'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </CustomDrawer>
  );
};

export default ManageAssetMaintenance;
