import SessionModel from "../models/Session.model"

export const bulkMarkAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params
        const { records } = req.body

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
                    update: record,
                    upsert: true
                }
            }))
        )

        res.status(200).json({ message: 'Attendance marked successfully' })
    } catch (error) {
        console.error('Error marking attendance:', error)
        res.status(500).json({ message: 'Server error' })
    }  
}