import DashboardLayout from "../dashboard/DashboardLayout.jsx";
import Table from "../../components/Table.jsx";

const rows = [];

export default function TimetableList() {
  return (
    <DashboardLayout title="Class Timetable">
      <section className="content-grid">
        <form className="panel form-panel">
          <h2>Add Class</h2>
          <select><option>Select batch</option></select>
          <input placeholder="Subject" />
          <input type="date" />
          <input type="time" />
          <button className="btn btn-primary" type="button">Save Timetable</button>
        </form>
        <section className="panel wide">
          <h2>Upcoming Classes</h2>
          <Table columns={["Date", "Batch", "Subject", "Teacher", "Time"]} rows={rows} />
        </section>
      </section>
    </DashboardLayout>
  );
}
