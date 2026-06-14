const ROUTE_STATUS = ['planned', 'in_progress', 'completed', 'cancelled'];

const WRITE_ROLES = ['admin', 'manager'];

// Transitions autorisées : de quel statut → vers quels statuts
const VALID_TRANSITIONS = {
  planned:     ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
};

module.exports = { ROUTE_STATUS, WRITE_ROLES, VALID_TRANSITIONS };
