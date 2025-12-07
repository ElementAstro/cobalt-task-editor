//! NINA Advanced Sequence types
//!
//! These types represent the full NINA sequencer format with containers,
//! conditions, triggers, and nested items.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

use super::common::SequenceEntityStatus;

/// Editor sequence item (matches frontend EditorSequenceItem)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSequenceItem {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub name: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub status: SequenceEntityStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_expanded: Option<bool>,
    #[serde(default)]
    pub data: HashMap<String, Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub items: Option<Vec<EditorSequenceItem>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub conditions: Option<Vec<EditorCondition>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub triggers: Option<Vec<EditorTrigger>>,
}

impl EditorSequenceItem {
    /// Check if this item is a container type
    pub fn is_container(&self) -> bool {
        self.item_type.contains("Container")
            || self.item_type.contains("SmartExposure")
            || self.item_type.contains("InstructionSet")
    }

    /// Get all nested item IDs recursively
    pub fn get_all_item_ids(&self) -> Vec<String> {
        let mut ids = vec![self.id.clone()];
        if let Some(items) = &self.items {
            for item in items {
                ids.extend(item.get_all_item_ids());
            }
        }
        ids
    }

    /// Find item by ID recursively
    pub fn find_item_by_id(&self, id: &str) -> Option<&EditorSequenceItem> {
        if self.id == id {
            return Some(self);
        }
        if let Some(items) = &self.items {
            for item in items {
                if let Some(found) = item.find_item_by_id(id) {
                    return Some(found);
                }
            }
        }
        None
    }

    /// Find item by ID mutably
    pub fn find_item_by_id_mut(&mut self, id: &str) -> Option<&mut EditorSequenceItem> {
        if self.id == id {
            return Some(self);
        }
        if let Some(items) = &mut self.items {
            for item in items {
                if let Some(found) = item.find_item_by_id_mut(id) {
                    return Some(found);
                }
            }
        }
        None
    }

    /// Validate the item
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.name.is_empty() {
            errors.push(format!("Item {} has no name", self.id));
        }

        if self.item_type.is_empty() {
            errors.push(format!("Item {} has no type", self.id));
        }

        // Validate nested items
        if let Some(items) = &self.items {
            for item in items {
                errors.extend(item.validate());
            }
        }

        errors
    }
}

/// Editor condition (matches frontend EditorCondition)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorCondition {
    pub id: String,
    #[serde(rename = "type")]
    pub condition_type: String,
    pub name: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(default)]
    pub data: HashMap<String, Value>,
}

/// Editor trigger (matches frontend EditorTrigger)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorTrigger {
    pub id: String,
    #[serde(rename = "type")]
    pub trigger_type: String,
    pub name: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(default)]
    pub data: HashMap<String, Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trigger_items: Option<Vec<EditorSequenceItem>>,
}

/// Editor target (matches frontend EditorTarget)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorTarget {
    pub name: String,
    pub ra: RaCoord,
    pub dec: DecCoord,
    pub rotation: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RaCoord {
    pub hours: i32,
    pub minutes: i32,
    pub seconds: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecCoord {
    pub degrees: i32,
    pub minutes: i32,
    pub seconds: f64,
    pub negative: bool,
}

/// Editor sequence (matches frontend EditorSequence)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EditorSequence {
    pub id: String,
    pub title: String,
    pub start_items: Vec<EditorSequenceItem>,
    pub target_items: Vec<EditorSequenceItem>,
    pub end_items: Vec<EditorSequenceItem>,
    pub global_triggers: Vec<EditorTrigger>,
}

impl EditorSequence {
    /// Create a new empty sequence
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            title: title.into(),
            start_items: Vec::new(),
            target_items: Vec::new(),
            end_items: Vec::new(),
            global_triggers: Vec::new(),
        }
    }

    /// Get all items from all areas
    pub fn all_items(&self) -> impl Iterator<Item = &EditorSequenceItem> {
        self.start_items
            .iter()
            .chain(self.target_items.iter())
            .chain(self.end_items.iter())
    }

    /// Find item by ID in any area
    pub fn find_item_by_id(&self, id: &str) -> Option<&EditorSequenceItem> {
        for item in self.all_items() {
            if let Some(found) = item.find_item_by_id(id) {
                return Some(found);
            }
        }
        None
    }

    /// Get total item count
    pub fn total_item_count(&self) -> usize {
        fn count_items(items: &[EditorSequenceItem]) -> usize {
            items.iter().fold(0, |acc, item| {
                acc + 1 + item.items.as_ref().map(|i| count_items(i)).unwrap_or(0)
            })
        }

        count_items(&self.start_items)
            + count_items(&self.target_items)
            + count_items(&self.end_items)
    }

    /// Validate the sequence
    pub fn validate(&self) -> Vec<String> {
        let mut errors = Vec::new();

        if self.title.is_empty() {
            errors.push("Sequence title is empty".to_string());
        }

        for item in &self.start_items {
            errors.extend(item.validate());
        }
        for item in &self.target_items {
            errors.extend(item.validate());
        }
        for item in &self.end_items {
            errors.extend(item.validate());
        }

        errors
    }
}

/// NINA JSON format types for serialization
pub mod nina_format {
    use super::*;

    /// NINA sequence root container
    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "PascalCase")]
    pub struct NinaSequenceRootContainer {
        #[serde(rename = "$id")]
        pub id: String,
        #[serde(rename = "$type")]
        pub type_name: String,
        pub name: Option<String>,
        pub sequence_title: Option<String>,
        pub strategy: NinaExecutionStrategy,
        pub is_expanded: bool,
        pub items: NinaItemCollection,
        pub conditions: NinaConditionCollection,
        pub triggers: NinaTriggerCollection,
        pub parent: Option<NinaRef>,
    }

    /// NINA sequence container
    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(rename_all = "PascalCase")]
    pub struct NinaSequenceContainer {
        #[serde(rename = "$id")]
        pub id: String,
        #[serde(rename = "$type")]
        pub type_name: String,
        pub name: Option<String>,
        pub strategy: NinaExecutionStrategy,
        pub is_expanded: bool,
        pub items: NinaItemCollection,
        pub conditions: NinaConditionCollection,
        pub triggers: NinaTriggerCollection,
        pub parent: Option<NinaRef>,
        #[serde(flatten)]
        pub extra: HashMap<String, Value>,
    }

    /// NINA execution strategy
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NinaExecutionStrategy {
        #[serde(rename = "$type")]
        pub type_name: String,
    }

    impl Default for NinaExecutionStrategy {
        fn default() -> Self {
            Self {
                type_name:
                    "NINA.Sequencer.Container.ExecutionStrategy.SequentialStrategy, NINA.Sequencer"
                        .to_string(),
            }
        }
    }

    /// NINA item collection
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NinaItemCollection {
        #[serde(rename = "$id")]
        pub id: String,
        #[serde(rename = "$type")]
        pub type_name: String,
        #[serde(rename = "$values")]
        pub values: Vec<Value>,
    }

    impl NinaItemCollection {
        pub fn new(id: String) -> Self {
            Self {
                id,
                type_name: "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.SequenceItem.ISequenceItem, NINA.Sequencer]], System.ObjectModel".to_string(),
                values: Vec::new(),
            }
        }
    }

    /// NINA condition collection
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NinaConditionCollection {
        #[serde(rename = "$id")]
        pub id: String,
        #[serde(rename = "$type")]
        pub type_name: String,
        #[serde(rename = "$values")]
        pub values: Vec<Value>,
    }

    impl NinaConditionCollection {
        pub fn new(id: String) -> Self {
            Self {
                id,
                type_name: "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Conditions.ISequenceCondition, NINA.Sequencer]], System.ObjectModel".to_string(),
                values: Vec::new(),
            }
        }
    }

    /// NINA trigger collection
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NinaTriggerCollection {
        #[serde(rename = "$id")]
        pub id: String,
        #[serde(rename = "$type")]
        pub type_name: String,
        #[serde(rename = "$values")]
        pub values: Vec<Value>,
    }

    impl NinaTriggerCollection {
        pub fn new(id: String) -> Self {
            Self {
                id,
                type_name: "System.Collections.ObjectModel.ObservableCollection`1[[NINA.Sequencer.Trigger.ISequenceTrigger, NINA.Sequencer]], System.ObjectModel".to_string(),
                values: Vec::new(),
            }
        }
    }

    /// NINA reference
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct NinaRef {
        #[serde(rename = "$ref")]
        pub reference: String,
    }
}
