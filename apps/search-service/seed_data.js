const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = "mongodb+srv://admin:Admin123@ac-xwpz1zi-shard-00-00.5dylhhw.mongodb.net/crm_db?retryWrites=true&w=majority";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const TicketSchema = new mongoose.Schema({ title: String, description: String, status: String, priority: String }, { strict: false });
        const Ticket = mongoose.model('Ticket', TicketSchema);

        const ContactSchema = new mongoose.Schema({ name: String, email: String, company: String, status: String }, { strict: false });
        const Contact = mongoose.model('Contact', ContactSchema);

        console.log("Creating Test Data...");
        
        await Ticket.create({ title: "Test Ticket Issue", description: "This is a test description", status: "Open", priority: "High" });
        await Contact.create({ name: "Test User", email: "test@example.com", company: "Test Corp", status: "New" });

        console.log("✅ Seeded Test Data");
    } catch (e) {
        console.error("Error", e);
    } finally {
        await mongoose.disconnect();
    }
};

seed();
