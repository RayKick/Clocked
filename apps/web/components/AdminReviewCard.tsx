export function AdminReviewCard(props: {
  reviewItem: {
    id: string;
    kind: string;
    reason: string | null;
    payloadJson: unknown;
    createdAt: Date;
  };
  adminPassword?: string;
}) {
  return (
    <article className="admin-card">
      <div className="admin-card-head">
        <strong>{props.reviewItem.kind}</strong>
        <span>{props.reviewItem.createdAt.toUTCString()}</span>
      </div>
      {props.reviewItem.reason ? <p>{props.reviewItem.reason}</p> : null}
      <pre>{JSON.stringify(props.reviewItem.payloadJson, null, 2)}</pre>
      <div className="admin-actions">
        <form action={`/api/admin/review/${props.reviewItem.id}/approve`} method="post">
          <input type="hidden" name="adminPassword" value={props.adminPassword ?? ""} />
          <input type="hidden" name="redirectTo" value="/admin/review" />
          <button type="submit">Approve</button>
        </form>
        <form action={`/api/admin/review/${props.reviewItem.id}/reject`} method="post">
          <input type="hidden" name="adminPassword" value={props.adminPassword ?? ""} />
          <input type="hidden" name="reason" value="Rejected from admin queue." />
          <input type="hidden" name="redirectTo" value="/admin/review" />
          <button type="submit" className="secondary">
            Reject
          </button>
        </form>
      </div>
    </article>
  );
}

