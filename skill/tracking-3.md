separation_tracks = separation_tracks[enough_visible]
separation_visibility = separation_visibility[enough_visible]
if query_features is not None:
    # query_features carries information about the original video
    # shape in zero-sized arrays; all tensors except these should
    # be indexed.
    query_features = jax.tree_util.tree_map(
        lambda x: x[:, enough_visible] if np.prod(x.shape) > 0 else x,
        query_features,
    # Filter only per-point feature arrays. Resolution entries encode metadata
    # in their shapes and must not be indexed as query points.
    query_features = query_features._replace(
        lowres=jax.tree_util.tree_map(
            lambda x: x[:, enough_visible], query_features.lowres
        ),
        hires=jax.tree_util.tree_map(
            lambda x: x[:, enough_visible], query_features.hires
        ),
)
separation_tracks_dict = jax.tree_util.tree_map(
lambda x: x[enough_visible], separation_tracks_dict
@@ -696,9 +699,9 @@ def fork_dict(param_dict, noise=0.0, mul=1.0):
noise=noise,
mul=mul,
)
          param_dict['cat_pred_base'] = new_cpb  # pytype: disable=unsupported-operands
          param_dict['cat_pred_fork1'] = new_cpf1  # pytype: disable=unsupported-operands
          param_dict['cat_pred_fork2'] = new_cpf2  # pytype: disable=unsupported-operands
          param_dict['cat_pred_base'] = new_cpb  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression
          param_dict['cat_pred_fork1'] = new_cpf1  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression
          param_dict['cat_pred_fork2'] = new_cpf2  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression
new_mpb, new_mpf1, new_mpf2 = do_fork(  # pylint: disable=cell-var-from-loop
param_dict['mat_pred_base'],
param_dict['mat_pred_fork1'],
@@ -707,13 +710,13 @@ def fork_dict(param_dict, noise=0.0, mul=1.0):
noise=noise,
mul=mul,
)
          param_dict['mat_pred_base'] = new_mpb  # pytype: disable=unsupported-operands
          param_dict['mat_pred_fork1'] = new_mpf1  # pytype: disable=unsupported-operands
          param_dict['mat_pred_fork2'] = new_mpf2  # pytype: disable=unsupported-operands
          param_dict['mat_pred_base'] = new_mpb  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression
          param_dict['mat_pred_fork1'] = new_mpf1  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression
          param_dict['mat_pred_fork2'] = new_mpf2  # pytype: disable=unsupported-operands  # pylint: disable=g-blanket-type-suppression

fork_dict(state.params['~'], noise=0.000001)
        fork_dict(state.opt_state[1][0].mu['~'], mul=0.0)  # pytype: disable=attribute-error
        fork_dict(state.opt_state[1][0].nu['~'], mul=1.0)  # pytype: disable=attribute-error
        fork_dict(state.opt_state[1][0].mu['~'], mul=0.0)  # pytype: disable=attribute-error  # pylint: disable=g-blanket-type-suppression
        fork_dict(state.opt_state[1][0].nu['~'], mul=1.0)  # pytype: disable=attribute-error  # pylint: disable=g-blanket-type-suppression

state = TrainingState(
params=state.params,
@@ -920,7 +923,7 @@ def build_models(
query_chunk_size=256,
):
"""Build tapir model for initialisation and tracking."""
  ckpt_state = np.load(checkpoint_path, allow_pickle=True).item()
  ckpt_state = np.load(checkpoint_path, allow_pickle=True).item()  # pylint: disable=g-unsafe-pickle-load
params, state = ckpt_state['params'], ckpt_state['state']

num_params = hk.data_structures.tree_size(params)
