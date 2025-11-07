import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { Users, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { DeleteButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';
import UserSelect from 'shared/UserSelect';
import {
  useCreateSalesTargetGroup,
  useSalesTargetGroup,
  useUpdateSalesTargetGroup,
} from '../../../../hooks/useSalesTargetGroups';
import { salesTargetGroupValidationSchema } from '../../../../schemas/salesTargetGroup.schema';
import type { SalesTargetGroup } from '../../../../services/masters/SalesTargetGroups';

interface ManageSalesTargetGroupProps {
  open: boolean;
  onClose: () => void;
  group?: SalesTargetGroup | null;
}

interface MemberFormData {
  sales_person_id: number | '';
  is_active: string;
  id?: number | null;
}

const ManageSalesTargetGroup: React.FC<ManageSalesTargetGroupProps> = ({
  open,
  onClose,
  group,
}) => {
  const isEdit = !!group;
  const [members, setMembers] = useState<MemberFormData[]>([]);

  const { data: groupResponse } = useSalesTargetGroup(group?.id || 0);

  const createGroupMutation = useCreateSalesTargetGroup();
  const updateGroupMutation = useUpdateSalesTargetGroup();

  const handleCancel = () => {
    onClose();
    setMembers([]);
    formik.resetForm();
  };

  React.useEffect(() => {
    if (group && groupResponse?.data) {
      const items =
        groupResponse.data.sales_target_group_members?.map(member => ({
          sales_person_id: member.sales_person_id,
          is_active: member.is_active,
          id: member.id,
        })) || [];
      setMembers(items);
      formik.setFieldValue('members', items);
    } else {
      setMembers([]);
      formik.setFieldValue('members', []);
    }
  }, [group, groupResponse]);

  const formik = useFormik({
    initialValues: {
      group_name: group?.group_name || '',
      description: group?.description || '',
      is_active: group?.is_active || 'Y',
      members: [],
    },
    validationSchema: salesTargetGroupValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const submitData = {
          ...values,
          description: values.description || undefined,
          salesTargetMember: members
            .filter(member => member.sales_person_id !== '')
            .map(member => ({
              sales_person_id: Number(member.sales_person_id),
              is_active: member.is_active,
              id: member.id || undefined,
            })),
        };

        if (isEdit && group) {
          await updateGroupMutation.mutateAsync({
            id: group.id,
            ...submitData,
          });
        } else {
          await createGroupMutation.mutateAsync(submitData);
        }
        handleCancel();
      } catch (error) {
        console.log('Error submitting sales target group:', error);
      }
    },
  });

  const addMember = () => {
    const newMember: MemberFormData = {
      sales_person_id: '',
      is_active: 'Y',
      id: null,
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    formik.setFieldValue('members', updatedMembers);
  };

  const removeMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
    formik.setFieldValue('members', updatedMembers);
  };

  const updateMember = (
    index: number,
    field: keyof MemberFormData,
    value: string
  ) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
    formik.setFieldValue('members', updatedMembers);
  };

  const membersWithIndex = members.map((member, index) => ({
    ...member,
    _index: index,
  }));

  const membersColumns: TableColumn<MemberFormData & { _index: number }>[] = [
    {
      id: 'sales_person_id',
      label: 'Sales Person',
      width: 300,
      render: (_value, row) => (
        <UserSelect
          name="sales_person_id"
          label="Sales Person"
          value={row.sales_person_id}
          setValue={value =>
            updateMember(row._index, 'sales_person_id', value.toString())
          }
          size="small"
          fullWidth
        />
      ),
    },
    {
      id: 'is_active',
      label: 'Status',
      width: 120,
      render: (_value, row) => (
        <Select
          value={row.is_active}
          onChange={e => updateMember(row._index, 'is_active', e.target.value)}
          size="small"
          fullWidth
          label="Status"
        >
          <MenuItem value="Y">Active</MenuItem>
          <MenuItem value="N">Inactive</MenuItem>
        </Select>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      width: 50,
      render: (_value, row) => (
        <DeleteButton
          onClick={() => removeMember(row._index)}
          tooltip="Remove member"
          confirmDelete={true}
          size="medium"
          itemName="member"
        />
      ),
    },
  ];

  return (
    <CustomDrawer
      open={open}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Sales Target Group' : 'Create Sales Target Group'}
      size="large"
    >
      <Box className="!p-4">
        <form onSubmit={formik.handleSubmit} className="!space-y-4">
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
            <Input
              name="group_name"
              label="Group Name"
              placeholder="Enter group name"
              formik={formik}
              required
            />

            <Select name="is_active" label="Status" formik={formik} required>
              <MenuItem value="Y">Active</MenuItem>
              <MenuItem value="N">Inactive</MenuItem>
            </Select>

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter group description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
          </Box>

          <Box className="!space-y-3">
            <Box className="!flex !justify-between !items-center">
              <Typography
                variant="body1"
                className="!font-semibold !text-gray-900"
              >
                Group Members
              </Typography>
              <Button
                type="button"
                variant="outlined"
                startIcon={<Plus />}
                onClick={addMember}
                size="small"
              >
                Add Member
              </Button>
            </Box>

            {members.length > 0 && (
              <Table
                data={membersWithIndex}
                columns={membersColumns}
                getRowId={row => row._index.toString()}
                pagination={false}
                sortable={false}
                emptyMessage="No members added yet."
              />
            )}

            {members.length === 0 && (
              <Box className="!text-center !py-8 !text-gray-500">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <Typography variant="body2">
                  No members added yet. Click "Add Member" to get started.
                </Typography>
              </Box>
            )}
          </Box>

          <Box className="!flex !justify-end !gap-2 !pt-3">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              disabled={
                createGroupMutation.isPending || updateGroupMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createGroupMutation.isPending || updateGroupMutation.isPending
              }
            >
              {createGroupMutation.isPending || updateGroupMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageSalesTargetGroup;
