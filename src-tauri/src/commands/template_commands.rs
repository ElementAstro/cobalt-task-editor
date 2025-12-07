//! Template management commands

use tauri::command;

use crate::models::{SimpleExposure, SimpleSequence, SimpleTarget};
use crate::services::template_service::{
    self, ExposureSetTemplate, SimpleSequenceTemplate, TargetTemplate, TemplateMetadata,
};

/// Save simple sequence as template
#[command]
pub async fn save_sequence_template(
    name: String,
    description: String,
    category: String,
    tags: Vec<String>,
    sequence: SimpleSequence,
) -> Result<TemplateMetadata, String> {
    template_service::save_simple_sequence_template(&name, &description, &category, tags, sequence)
        .await
}

/// Load simple sequence template
#[command]
pub async fn load_sequence_template(id: String) -> Result<SimpleSequenceTemplate, String> {
    template_service::load_simple_sequence_template(&id).await
}

/// List simple sequence templates
#[command]
pub async fn list_sequence_templates() -> Result<Vec<TemplateMetadata>, String> {
    template_service::list_simple_sequence_templates().await
}

/// Delete simple sequence template
#[command]
pub async fn delete_sequence_template(id: String) -> Result<(), String> {
    template_service::delete_simple_sequence_template(&id).await
}

/// Save target as template
#[command]
pub async fn save_target_template(
    name: String,
    description: String,
    tags: Vec<String>,
    target: SimpleTarget,
) -> Result<TemplateMetadata, String> {
    template_service::save_target_template(&name, &description, tags, target).await
}

/// Load target template
#[command]
pub async fn load_target_template(id: String) -> Result<TargetTemplate, String> {
    template_service::load_target_template(&id).await
}

/// List target templates
#[command]
pub async fn list_target_templates() -> Result<Vec<TemplateMetadata>, String> {
    template_service::list_target_templates().await
}

/// Save exposure set as template
#[command]
pub async fn save_exposure_template(
    name: String,
    description: String,
    tags: Vec<String>,
    exposures: Vec<SimpleExposure>,
) -> Result<TemplateMetadata, String> {
    template_service::save_exposure_set_template(&name, &description, tags, exposures).await
}

/// Load exposure set template
#[command]
pub async fn load_exposure_template(id: String) -> Result<ExposureSetTemplate, String> {
    template_service::load_exposure_set_template(&id).await
}

/// List exposure set templates
#[command]
pub async fn list_exposure_templates() -> Result<Vec<TemplateMetadata>, String> {
    template_service::list_exposure_set_templates().await
}

/// Apply target template (returns new target with new ID)
#[command]
pub async fn apply_target_template(id: String) -> Result<SimpleTarget, String> {
    let template = template_service::load_target_template(&id).await?;
    let mut target = template.target;

    // Generate new ID
    target.id = uuid::Uuid::new_v4().to_string();
    target.status = crate::models::SequenceEntityStatus::Created;

    // Reset progress for exposures
    for exp in &mut target.exposures {
        exp.id = uuid::Uuid::new_v4().to_string();
        exp.progress_count = 0;
        exp.status = crate::models::SequenceEntityStatus::Created;
    }

    Ok(target)
}

/// Apply exposure set template (returns new exposures with new IDs)
#[command]
pub async fn apply_exposure_template(id: String) -> Result<Vec<SimpleExposure>, String> {
    let template = template_service::load_exposure_set_template(&id).await?;

    Ok(template
        .exposures
        .into_iter()
        .map(|mut exp| {
            exp.id = uuid::Uuid::new_v4().to_string();
            exp.progress_count = 0;
            exp.status = crate::models::SequenceEntityStatus::Created;
            exp
        })
        .collect())
}
