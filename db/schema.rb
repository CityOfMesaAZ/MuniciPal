# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140604040701) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "postgis"

  create_table "council_districts", force: true do |t|
    t.integer  "district"
    t.string   "name"
    t.string   "twit_name"
    t.string   "twit_wdgt"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.spatial  "geom",       limit: {:srid=>0, :type=>"geometry"}
  end

  create_table "event_items", force: true do |t|
    t.integer  "event_id"
    t.integer  "EventItemId"
    t.string   "EventItemGuid"
    t.string   "EventItemLastModified"
    t.string   "EventItemLastModifiedUtc"
    t.string   "EventItemRowVersion"
    t.integer  "EventItemEventId"
    t.integer  "EventItemAgendaSequence"
    t.integer  "EventItemMinutesSequence"
    t.string   "EventItemAgendaNumber"
    t.string   "EventItemVideo"
    t.integer  "EventItemVideoIndex"
    t.string   "EventItemVersion"
    t.string   "EventItemAgendaNote"
    t.string   "EventItemMinutesNote"
    t.integer  "EventItemActionId"
    t.string   "EventItemAction"
    t.text     "EventItemActionText"
    t.integer  "EventItemPassedFlag"
    t.string   "EventItemPassedFlagText"
    t.integer  "EventItemRollCallFlag"
    t.string   "EventItemFlagExtra"
    t.text     "EventItemTitle"
    t.integer  "EventItemTally"
    t.integer  "EventItemConsent"
    t.integer  "EventItemMoverId"
    t.string   "EventItemMover"
    t.integer  "EventItemSeconderId"
    t.string   "EventItemSeconder"
    t.integer  "EventItemMatterId"
    t.string   "EventItemMatterGuid"
    t.string   "EventItemMatterFile"
    t.string   "EventItemMatterName"
    t.string   "EventItemMatterType"
    t.string   "EventItemMatterStatus"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "events", force: true do |t|
    t.integer  "EventId"
    t.string   "EventGuid"
    t.string   "EventLastModified"
    t.string   "EventLastModifiedUtc"
    t.string   "EventRowVersion"
    t.integer  "EventBodyId"
    t.string   "EventBodyName"
    t.string   "EventDate"
    t.string   "EventTime"
    t.string   "EventVideoStatus"
    t.integer  "EventAgendaStatusId"
    t.integer  "EventMinutesStatusId"
    t.string   "EventLocation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
