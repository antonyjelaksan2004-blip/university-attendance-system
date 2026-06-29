import DashboardLayout from "../dashboard/DashboardLayout.jsx";
import Table from "../../components/Table.jsx";

const rows = [];

export default function CampusList() {
  return (
    <DashboardLayout title="Campus Locations">
      <section className="content-grid">
        <form className="panel form-panel">
          <h2>Add Campus</h2>
          <input placeholder="Campus name" />
          <input placeholder="Latitude" />
          <input placeholder="Longitude" />
          <input placeholder="Radius meters" />
          <button className="btn btn-primary" type="button">Save Campus</button>
        </form>
        <section className="panel wide">
          <h2>Locations</h2>
          <Table columns={["Campus", "Latitude", "Longitude", "Radius", "Status"]} rows={rows} />
        </section>
      </section>
    </DashboardLayout>
  );
}
