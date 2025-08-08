import type { Diagnosis, LabTest, MedicalRecords } from '@prisma/client';
import { format } from 'date-fns';
import { BriefcaseBusiness } from 'lucide-react';

import { ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { trpc } from '@/trpc/server';
import type { SearchParamsProps } from '@/types';
import { DATA_LIMIT } from '@/utils/seetings';

// import { getMedicalRecords } from '@/utils/services/medical-record'

const columns = [
  {
    header: 'No',
    key: 'no'
  },
  {
    header: 'Info',
    key: 'name'
  },
  {
    header: 'Date & Time',
    key: 'medical_date',
    className: 'hidden md:table-cell'
  },
  {
    header: 'Doctor',
    key: 'doctor',
    className: 'hidden 2xl:table-cell'
  },
  {
    header: 'Diagnosis',
    key: 'diagnosis',
    className: 'hidden lg:table-cell'
  },
  {
    header: 'Lab Test',
    key: 'lab_test',
    className: 'hidden 2xl:table-cell'
  },
  {
    header: 'Action',
    key: 'action',
    className: ''
  }
];

interface ExtendedProps extends MedicalRecords {
  patient: {
    img: string | null;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    colorCode: string | null;
  };
  diagnosis: Diagnosis[];
  labTest: LabTest[];
}

const MedicalRecordsPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const pageParam = typeof searchParams?.p === 'string' ? searchParams.p : '1';
  const page = Number(pageParam);
  const searchQuery = (searchParams?.q || '') as string;
  const { data, totalPages, totalRecords, currentPage } =
    await trpc.medicalRecords.getMedicalRecords({
      page,
      search: searchQuery
    });

  if (!data) return null;

  const renderRow = (item: ExtendedProps) => {
    const name = `${item?.patient?.firstName} ${item?.patient?.lastName}`;
    const patient = item?.patient;

    return (
      <tr
        className='border-gray-200 border-b text-sm even:bg-slate-50 hover:bg-slate-50'
        key={item?.id}
      >
        <td className='flex items-center gap-4 p-4'>
          <ProfileImage
            bgColor={patient?.colorCode ?? '0000'}
            name={name}
            textClassName='text-black'
            url={item?.patient?.img ?? ''}
          />
          <div>
            <h3 className='uppercase'>{name}</h3>
            <span className='text-sm capitalize'>{patient?.gender}</span>
          </div>
        </td>
        <td className='hidden md:table-cell'>{format(item?.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
        <td className='hidden 2xl:table-cell'>{item?.doctorId}</td>
        <td className='hidden lg:table-cell'>
          {item?.diagnosis?.length === 0 ? (
            <span className='text-gray-400 italic'>No diagnosis found</span>
          ) : (
            <span>{item?.diagnosis.length}</span>
          )}
        </td>
        <td className='hidden xl:table-cell'>
          {item?.labTest?.length === 0 ? (
            <span className='text-gray-400 italic'>No lab found</span>
          ) : (
            <span>{item?.labTest.length}</span>
          )}
        </td>

        <td>
          <ViewAction href={`/appointments/${item?.appointmentId}`} />
        </td>
      </tr>
    );
  };

  return (
    <div className='rounded-xl bg-white px-3 py-6 2xl:px-6'>
      <div className='flex items-center justify-between'>
        <div className='hidden items-center gap-1 lg:flex'>
          <BriefcaseBusiness
            className='text-gray-500'
            size={20}
          />

          <p className='font-semibold text-2xl'>{totalRecords}</p>
          <span className='text-gray-600 text-sm xl:text-base'>total records</span>
        </div>
        <div className='flex w-full items-center justify-between gap-2 lg:w-fit lg:justify-start'>
          <SearchInput />
        </div>
      </div>

      <div className='mt-4'>
        <Table
          columns={columns}
          data={data}
          renderRow={renderRow}
        />

        <Pagination
          currentPage={currentPage}
          limit={DATA_LIMIT}
          totalPages={totalPages}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
};

export default MedicalRecordsPage;
