import mongoose from 'mongoose';

function buildConnectionHelp(error) {
    const message = error?.message || '';

    if (message.includes('querySrv') || message.includes('ESERVFAIL') || message.includes('ENOTFOUND')) {
        return [
            'MongoDB Atlas SRV lookup failed.',
            'Your network or DNS resolver could not resolve the `mongodb+srv://` address.',
            'If this keeps happening, add a standard Atlas connection string as `MONGO_URI_DIRECT` in `server/.env` and keep `MONGO_URI` as a fallback.',
        ].join(' ');
    }

    return null;
}

const connectDB = async () => {
    const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

    if (!uri) {
        throw new Error('Missing MongoDB connection string. Set `MONGO_URI` or `MONGO_URI_DIRECT` in `server/.env`.');
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        const help = buildConnectionHelp(error);
        if (help) {
            console.error(help);
        }
        process.exit(1);
    }
};

export default connectDB;
