import SessionModel from "../models/Session.model.js"
import AttendanceModel from "../models/Attendance.model.js"
import BootcampModel from "../models/Bootcamp.model.js";

import z from "zod"
import ExcelJS from 'exceljs';



const bulkAttendanceSchema = z.object({
    records: z.array(z.object({
        studentId: z.string().min(1),
        status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
        note: z.string().optional()
    })).min(1),
    sessionId: z.string().min(1)
})

export const bulkMarkAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params
        const { records } = req.body
        /**
         * records = [
         *  {
         *      studentId: '123',
         *     status: 'Present' | 'Absent' | 'Late',
         *     note: 'Optional note'
         * }
         */

        const parsedData = bulkAttendanceSchema.safeParse({ records, sessionId })
        if (!parsedData.success) {
            return res.status(400).json({ message: 'Invalid attendance data', errors: parsedData.error.errors })
        }
        

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ message: 'Invalid attendance data' })
        }

        const session = await SessionModel.findById(sessionId)
        if (!session) {
            return res.status(404).json({ message: 'Session not found' })
        }

        //TODO: 24-hour window check

        const attendanceData = records.map(record => {
            let finalStatus = record.status

            const minsPastStart = (Date.now() - new Date(session.startTime)) / (1000 * 60)
            if(record.status === 'Present' && minsPastStart > 10) {
                finalStatus = 'Late'
            }

            return {
                session: sessionId,
                student: record.studentId,
                status: finalStatus,
                note: record.note || '',
                markedBy: req.user.id
            }
        })

        await AttendanceModel.bulkWrite(
            attendanceData.map(record => ({
                updateOne: {
                    filter: { session: record.session, student: record.student },
                    update: { $set: record },
                    upsert: true
                }
            }))
        )

        res.status(200).json({ message: 'Attendance marked successfully' })
    } catch (error) {
        console.error('Error marking attendance:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }  
}

const getAttendanceRecordsSchema = z.object({
    sessionId: z.string().min(1)
})
export const getAttendanceSheet = async (req, res) => {
    const parsedData = getAttendanceRecordsSchema.safeParse(req.params)
    if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid session ID', errors: parsedData.error.errors })
    }
    const { sessionId } = parsedData.data

    try {
        const attendanceRecords = await AttendanceModel.find({ session: sessionId })
            .populate('student', 'firstName lastName email')
            .populate('markedBy', 'firstName lastName email')

        res.status(200).json({ 
            message: 'Attendance sheet retrieved successfully',
            attendance: attendanceRecords 
        })    
    } catch (error) {
        console.error('Error retrieving attendance sheet:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const markIndividualAttendanceSchema = z.object({
    sessionId: z.string().min(1),
    studentId: z.string().min(1),
    status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
    note: z.string().optional()
})

export const markIndividualAttendance = async (req, res) => {
    const parsedData = markIndividualAttendanceSchema.safeParse({ ...req.body, ...req.params })
    if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid attendance data', errors: parsedData.error.errors })
    }
    const { sessionId, studentId, status, note } = parsedData.data

    try {
        const session = await SessionModel.findById(sessionId)
        if (!session) {
            return res.status(404).json({ message: 'Session not found' })
        }

        const attendanceRecord = await AttendanceModel.findOneAndUpdate(
            { session: sessionId, student: studentId },
            { status, note, markedBy: req.user.id },
            { new: true, upsert: true }
        )

        res.status(200).json({ message: 'Attendance marked successfully' })
    } catch (error) {
        console.error('Error marking individual attendance:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }

}

const markExecusedAbsenceSchema = z.object({
    sessionId: z.string().min(1),
    studentId: z.string().min(1),
    note: z.string()
})
export const markExecusedAbsence = async (req, res) => {
    const parsedData = markExecusedAbsenceSchema.safeParse({ ...req.body, ...req.params })
    if (!parsedData.success) {
        return res.status(400).json({ message: 'Invalid data', errors: parsedData.error.errors })
    }

    const { sessionId, studentId, note } = parsedData.data

    try {
        const session = await SessionModel.findById(sessionId)
        if (!session) {
            return res.status(404).json({ message: 'Session not found' })
        }

        const attendanceRecord = await AttendanceModel.findOneAndUpdate(
            { session: sessionId, student: studentId },
            { status: 'Excused', note, markedBy: req.user.id },
            { new: true, upsert: true }
        )

        res.status(200).json({ message: 'Excused absence marked successfully' })
    } catch (error) {
        console.error('Error marking excused absence:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

const attendanceReportSchema = z.object({
    bootcampId: z.string().min(1),
})
export const attendanceReport = async (req, res) => {
    const parsedData = attendanceReportSchema.safeParse(req.params)

    if (!parsedData.success) return res.status(400).json({ message: 'Invalid bootcamp ID', errors: parsedData.error.errors })
    const { bootcampId } = parsedData.data

    try {
        const sessions = await SessionModel.find({ bootcamp: bootcampId })
        const sessionIds = sessions.map(session => session._id)

        const attendanceRecords = await AttendanceModel.find({ session: { $in: sessionIds } })
            .populate('student', 'firstName lastName email')
            .populate('session', 'title startTime endTime')

        const report = attendanceRecords.map(record => ({
            studentName: `${record.student.firstName} ${record.student.lastName}`,
            studentEmail: record.student.email,
            sessionTitle: record.session.title,
            sessionStart: record.session.startTime,
            sessionEnd: record.session.endTime,
            status: record.status,
            note: record.note
        }))

        res.status(200).json({ 
            message: 'Attendance report generated successfully',
            report 
        })
    } catch (error) {
        console.error('Error generating attendance report:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}


const exportAttendanceReportSchema = z.object({
    bootcampId: z.string().min(1),
})

export const exportAttendanceReport = async (req, res) => {
    const parsedData = exportAttendanceReportSchema.safeParse(req.params)
    if (!parsedData.success) return res.status(400).json({ message: 'Invalid bootcamp ID', errors: parsedData.error.errors })

    const { bootcampId } = parsedData.data

    try {
        const bootcamp = await BootcampModel.findById(bootcampId);
        const bootcampTitle = bootcamp ? bootcamp.name : 'Bootcamp';

        const sessions = await SessionModel.find({ bootcamp: bootcampId })
        const sessionIds = sessions.map(session => session._id)
        
        const attendanceRecords = await AttendanceModel.find({ session: { $in: sessionIds } })
            .populate('student', 'firstName lastName email')
            .populate('session', 'title startTime endTime')
            .populate('markedBy', 'firstName lastName email')
        
        const formatDateTime = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };

        const reportData = attendanceRecords.map(record => ({
            studentName: `${record.student.firstName} ${record.student.lastName}`,
            studentEmail: record.student.email,
            sessionTitle: record.session.title,
            sessionStart: formatDateTime(record.session.startTime),
            sessionEnd: formatDateTime(record.session.endTime),
            status: record.status,
            note: record.note,
            markedBy: record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'N/A'
        }));

        // Excel export logic
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');


        worksheet.columns = [
            { header: 'Student Name', key: 'studentName', width: 25 },
            { header: 'Student Email', key: 'studentEmail', width: 30 },
            { header: 'Session Title', key: 'sessionTitle', width: 25 },
            { header: 'Session Start', key: 'sessionStart', width: 20 },
            { header: 'Session End', key: 'sessionEnd', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Note', key: 'note', width: 30 },
            { header: 'Marked By', key: 'markedBy', width: 25 },
        ];

        worksheet.insertRow(1, [`Bootcamp: ${bootcampTitle}`]);
        worksheet.insertRow(2, []); 
        worksheet.mergeCells(`A1:H1`);
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        reportData.forEach(row => {
            const addedRow = worksheet.addRow(row);
            const statusCell = addedRow.getCell('status');
            let fillColor = null;
            switch (row.status) {
                case 'Present':
                    fillColor = 'FFB6EF8B'; 
                    break;
                case 'Absent':
                    fillColor = 'FFFF7F7F'; 
                    break;
                case 'Late':
                    fillColor = 'FFFFC966'; 
                    break;
                case 'Excused':
                    fillColor = 'FF8ECFFF'; 
                    break;
                default:
                    fillColor = null;
            }
            if (fillColor) {
                statusCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: fillColor }
                };
            }
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${bootcampTitle}_attendance_report.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting attendance report:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

